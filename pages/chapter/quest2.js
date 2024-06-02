import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../../constants/btthAddress.json';
import ContractAbi from '../../constants/btthAbi.json';
import { Card, useNotification } from 'web3uikit';
import levelToValue from "../../constants/lvtoValueatLg.mjs";
import Image from 'next/image';
import { db } from '../../constants/firebaseConfig'
import { getDocs, query, collection, where, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
export default function Character() {
    const { chainId, account } = useMoralis();
    const { runContractFunction } = useWeb3Contract();
    const [character, setCharacter] = useState(null);
    const [playerHealth, setPlayerHealth] = useState(null);
    const [playerDefence, setPlayerDefence] = useState(null);
    const [playerQi, setPlayerQi] = useState(null);
    const [playerDamage, setPlayerDamage] = useState(null);
    const [playerLevel, setPlayerLevel] = useState("");
    const [checkThings, setCheck] = useState(false);
    const [mobState, setMobState] = useState([]);
    const router = useRouter();
    const [checkquest1,setquest1]=useState(false);
    const [checkquest2,setquest2]=useState(false);
    const [checkPrevQuest,setCheckPrevQuest]=useState(null);
    const chainString = chainId ? parseInt(chainId).toString() : '80002';
    const btthAddress = networkMapping[chainString]?.btthGame[0];
    const dispatch = useNotification();
  
    async function updateGoldcoin(simpleAccount, newGoldcoin) {
        try {
          // Query for the document based on the account field
          const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", simpleAccount)));
      
          // Check if there is any document that matches the query
          if (!querySnapshot.empty) {
            // There should be only one document matching the account
            const doc = querySnapshot.docs[0];
      
            // Get a reference to the document
            const docRef = doc.ref;
      
            // Update only the "goldcoin" field of the document
            await updateDoc(docRef, { goldcoin: newGoldcoin });
      
            console.log("Goldcoin updated successfully");
            return true; // Indicate success
          } else {
            console.log("No document found for the provided account");
            return false; // Indicate failure
          }
        } catch (error) {
          console.error("Error updating goldcoin: ", error);
          return false; // Indicate failure
        }
      }
    // Initialize mob array and skill array
    const initialMobs = [
        { name: "xiao-ke", health: 250, defense: 10, attack: 20, level: "six star dou zhi qi" },
        { name: "xiao-ning", health: 280, defense: 15, attack: 30, level: "one star dou zhi"}
    ];

    const skillArray = [
        { name: "vaccum palm", qiCost: 10 },
        { name: "octane Blast", qiCost: 20 }
    ];

    const fetchCharacterDetails = async () => {
        try {
            const characterData = await runContractFunction({
                params: {
                    contractAddress: btthAddress,
                    abi: ContractAbi,
                    functionName: 'getCharacterDetails',
                    params:{
                      to:account,
                    }
                },
            });

            // Set character data to state
            setCharacter(characterData);
            setPlayerHealth(characterData.health.toString());
            setPlayerDefence(characterData.defense.toString());
            setPlayerQi(characterData.qi.toString());
            setPlayerDamage(characterData.attackDamage.toString());
            setPlayerLevel(characterData.level.toString());
            setMobState(initialMobs);
        } catch (error) {
            console.error('Error fetching character details:', error);
            dispatch({ position: "topR", type: 'ERROR', message: 'Error fetching character details' });
        }
    };

    
    const normalAttack = (index) => {
        if (playerHealth <= 0) {
            console.log("You failed. Restart.");
            return;
        }

        const updatedMobs = [...mobState];
        const mob = updatedMobs[index];

         if (mob.health <= 0) {
            console.log("NPC is already defeated.");
            return;
        }
          
        mob.health > (playerDamage - mob.defense)>0?mob.health-=playerDamage-mob.defense:mob.health=0;
        if (mob.health > 0) {
            setPlayerHealth(prev => prev - (mob.attack - playerDefence));
        } else {
            console.log("Congratulations, you won!");
        }

        setMobState(updatedMobs);
    };

    const skillAttack = (mobIndex, skillIndex) => {
        const updatedMobs = [...mobState];
        const mob = updatedMobs[mobIndex];
        const skill = skillArray[skillIndex];

        if (skill.name === "vaccum palm" &&playerQi>=10&&mob.health !== 0&&playerHealth>0) {
            if (levelToValue[playerLevel] >= levelToValue[mob.level]) {
                mob.health = 0;
                setPlayerQi(prev => prev - skill.qiCost);
            } else {
                setPlayerHealth(prev => prev / 2);
                setPlayerQi(prev => prev - skill.qiCost);
            }
        } else if (skill.name === "octane Blast"&& playerQi>=20&& mob.health !== 0&&playerHealth>0) {
            const pureDamage = playerQi * 10;
            if (mob.health <= pureDamage) {
                mob.health = 0;
                setPlayerQi(prev => prev - skill.qiCost);
            } else {
                mob.health -= mob.health / 4;
                setPlayerHealth(prev => prev / 2);
                setPlayerQi(prev => prev - skill.qiCost);
            }
        }

        setMobState(updatedMobs);
    };

    const handlemob1prize = async() => {
        if(mobState[0].health==0&&mobState[1].health==0&&checkThings==false){
          try {
            const characterData = await runContractFunction({
                params: {
                    contractAddress: btthAddress,
                    abi: ContractAbi,
                    functionName: 'inventorySkillUpdate',
                    params:{
                      name:"fire blaze",
                      qiCost:0
                    }
                },
                onSuccess:handlSuccess1
            });

        }
        catch(error){
          console.error('cannot update:', error);
          dispatch({ position: "topR", type: 'ERROR', message: 'cannot update' });
        }
      }
        else{
          console.log("you have to restart")
        }
    };
    const handlSuccess1=async(tx)=>{
      await tx.wait(1);
      dispatch({ position: "topR", type: 'success', message: 'succesfully updated' });
      setquest1(true);
    }
    const handleClaimSubmit=async()=>{
      if(mobState[0].health==0&&mobState[1].health==0&&checkquest1&&checkThings==false){
        try {
          const characterData = await runContractFunction({
              params: {
                  contractAddress: btthAddress,
                  abi: ContractAbi,
                  functionName: 'characterUpdate',
                  params:{
                    questIndex: 2,
                    level: "one star dou zhi",
                    Index: 0,
                    Maxhealth: 400,
                    health: playerHealth,
                    attackDamage: 40,
                    defense: 15,
                    weapon: "none",
                    qi: playerQi,
                    maxQi: 60
                  }
              },
              onSuccess:handlSuccess2
          });

      }
      catch(error){
        console.error('cannot update:', error);
        dispatch({ position: "topR", type: 'ERROR', message: 'cannot update' });
      }
    }
      
      else{
        console.log("you have to restart")
      }
    }
    const handlSuccess2=async(tx)=>{
      await tx.wait(1);
      await updateGoldcoin(account,60000);
      dispatch({ position: "topR", type: 'success', message: ' character succesfully updated' });
      router.push('quest3');
   
    }
    
      const setUpUi = async () => {
        try {
          const nextui = await runContractFunction({
            params: {
              abi: ContractAbi,
              contractAddress: btthAddress,
              functionName: "getQuestStatus",
              params: {
                questIndex: 2
              }
            }
          });
          if (nextui) {
            setCheck(nextui);
          }
        } catch (error) {
          console.error("Error fetching quest status:", error);
        }
      };
      const setUpUi2 = async () => {
        try {
          const nextui = await runContractFunction({
            params: {
              abi: ContractAbi,
              contractAddress: btthAddress,
              functionName: "getQuestStatus",
              params: {
                questIndex: 1
              }
            }
          });
          if (nextui) {
            setCheckPrevQuest(nextui);
          }
        } catch (error) {
          console.error("Error fetching quest status:", error);
        }
      };
      const handleGoNext=()=>{
        router.push('quest3')
      }
      const handleGoPrev=()=>{
        router.push('quest1')
      }
    useEffect(() => {
      fetchCharacterDetails();
      setUpUi2();
      setUpUi()
      const intervalId = setInterval(() => {
        setUpUi();
        setUpUi2();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

    return (
        <div className="min-h-screen bg-purple-900 p-4">

          {checkPrevQuest&&!checkThings?
         <div>
        <div className='m-4'>
            <Card>
                <div className='flex flex-col items-center'>
                <p className='text-3xl text-red-900'> Important </p>
                <p className=' text-zinc-700 text-xl'> 🅰️.you have to kill both npc without die to claim any prize after that you have to submit the quest</p>
                <p className=' text-zinc-700 text-xl'>1. vaccum palm: if opponent level is lesser than or equal to yours it is effective</p>
                <p className=' text-zinc-700 text-xl'>2. octane blast: if you have good amount of qi then it is effective</p>
                </div>
            </Card> 
        
            </div>
            <div className="container mx-auto">
                {character ? (
                    <div>
                        <Card title="Character Details" description="">
                            <div className="mb-4 flex flex-col items-center">
                                <Image src="/xiaoYan.jpg" width={200} height={100} className="w-32 h-32 mb-4" />
                                <p>Health: {playerHealth}</p>
                                <p>Defense: {playerDefence}</p>
                                <p>Qi: {playerQi}</p>
                                <p>Level: {playerLevel}</p>
                                <p>Attack Damage: {playerDamage}</p>
                            </div>
                        </Card>
                        <div className="grid grid-cols-1 m-3 md:grid-cols-2 gap-4">
                            {mobState.map((mob, index) => (
                                <div key={index} className="mb-4">
                                    <Card title={mob.name} description={`Level: ${mob.level}`}>
                                        <div className="mb-4 flex flex-col items-center">
                                            <Image src={`/${mob.name.toLowerCase()}.jpg`} width={200} height={100} alt={mob.name} className="w-32 h-32 mb-4" />
                                            <p>Health: {mob.health}</p>
                                            <p>Defense: {mob.defense}</p>
                                            <p>Attack: {mob.attack}</p>
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                                onClick={() => normalAttack(index)}
                                            >
                                                Normal Attack
                                            </button>
                                            {skillArray.map((skill, skillIndex) => (
                                                <button
                                                    key={skillIndex}
                                                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                                                    onClick={() => skillAttack(index, skillIndex)}
                                                >
                                                    {skill.name}
                                                </button>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                        <div className='flex flex-col'>
                         
                              <Card>
                                <div className=' flex justify-center'>
                                  <div className=' mx-3'>
                                <button onClick={handlemob1prize} className='bg-green-500 text-white px-4 py-2 rounded mt-4'>
                                    Claim Prize
                                </button>
                                </div>
                           
                                <div className='mx-3'>
                                <button onClick={handleClaimSubmit} className=' bg-amber-700 text-white px-4 py-2 rounded mt-4'>
                                    Claim&submit
                                </button>
                                </div>
                                </div>
                                </Card>
                        </div>
                  

                    </div>
                ) : (
                    <div>Loading...</div>
                )}
                
            </div>
            </div>
            :
                (
                  <div class='flex flex-col items-center'>
                  <div class='text-3xl text-center text-red-950 font-bold'>
                      Finish previous quest or you have already completed
                  </div>
                  <div class='flex flex-row space-x-4  mt-10'>
                      <div>
                          <button  onClick={handleGoPrev}class='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700'>
                             prev quest
                          </button>
                      </div>
                      <div>
                          <button onClick={handleGoNext}class='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700'>
                              next quest
                          </button>
                      </div>
                  </div>
              </div>
              
              )
          }
        </div>
    );
}

