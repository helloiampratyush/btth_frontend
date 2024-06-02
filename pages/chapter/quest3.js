import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../../constants/btthAddress.json';
import ContractAbi from '../../constants/btthAbi.json';
import { Card,Select, useNotification } from 'web3uikit';
import levelToValue from "../../constants/lvtoValueatLg.mjs";
import { db } from '../../constants/firebaseConfig';
import { getDocs, query, collection, where, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
export default function Quest3() {
    const router=useRouter();
    const {chainId, account,isWeb3Enabled} = useMoralis();
    const dispatch=useNotification();
    const [checkQuest,setCheckQuest]=useState(false);
    const {runContractFunction} = useWeb3Contract();
    const [invData,setInventoryData]=useState(null);
    const [visible, setVisible] = useState(false);
    const [Inventory,setInventory]=useState(null);
    const [Character, setCharacter] = useState(null);
    const [playerHealth, setPlayerHealth] = useState(null);
    const [playerDefence, setPlayerDefence] = useState(null);
    const [playerQi, setPlayerQi] = useState(null);
    const [playerDamage, setPlayerDamage] = useState(null);
    const [playerLevel, setPlayerLevel] = useState("");
    const [npcHealth,setNpcHealth]=useState("")
    const [npcDefence,setnpcDefence]=useState(null);
    const [npcAttack,setNpcAttack]=useState(null);
    const [selectSkillIndex,setSelectedSkillIndex]=useState(null);
    const chainString = chainId ? parseInt(chainId).toString() : '80002';
    const btthAddress = networkMapping[chainString]?.btthGame[0];

    useEffect(()=>{
        fetchdatabases();
        setUpUi1();
        setUpUi2();
    },[account,isWeb3Enabled])
  const setUpUi1=async()=>{
      const setMe=await runContractFunction({
        params:{
          abi:ContractAbi,
          contractAddress:btthAddress,
          functionName:"getInventory", 
          params:{
            to:account
          },
        },

      })
      if(setMe){
        setInventory(setMe);
      }
   }
    const setUpUi2=async()=>{
        const setMe=await runContractFunction({
          params:{ 
            abi:ContractAbi,
            contractAddress:btthAddress,
            functionName:"getQuestStatus",   
            params:{
                questIndex:3,
            },

          },
        })
        if(setMe){
         setCheckQuest(setMe);
        }
    }
    const handleClickMe = async () => {
        setVisible(true);
        const setMe = await runContractFunction({
            params: {
                abi: ContractAbi,
                contractAddress: btthAddress,
                functionName: "getCharacterDetails",
                params: {
                    to: account,
                }
            }
        });

        if (setMe) {
            setCharacter(setMe);
            setPlayerHealth(setMe.health.toString());
            setPlayerDefence(setMe.defense.toString());
            setPlayerQi(setMe.qi.toString());
            setPlayerDamage(setMe.attackDamage.toString());
            setPlayerLevel(setMe.level);
            setNpcHealth(npc.health);
            setNpcAttack(npc.attackDamage);
        setnpcDefence(npc.defense);
        }
    }

    // Placeholder NPC stats
    const npc = {
        level: "two star dou zhi",
        maxHealth: 800,
        health: 700,
        attackDamage: 50,
        defense:10
    };
    const handleAttack = () => {
        const playerEffectiveHealth = playerHealth + playerDefence;
        const npcEffectiveHealth = npcHealth + npcDefence;
    
        // Calculate and update health values if both parties can survive the attack
        if ((npcEffectiveHealth > playerDamage) && (playerEffectiveHealth > npcAttack)) {
            setPlayerHealth(prev => Math.max(prev - (npcAttack - playerDefence), 0));
            setNpcHealth(prev => Math.max(prev - (playerDamage - npcDefence), 0));
        }
    
        // Check if the NPC is defeated
        if (npcEffectiveHealth <= playerDamage) {
            setNpcHealth(0);
            dispatch({
                position: "topR",
                type: "success",
                title: "congratulations",
                message: "you have defeated jia lie ao"
            });
        }
    
        // Check if the player is defeated
        if ((npcEffectiveHealth > playerDamage) && (playerEffectiveHealth <= npcAttack)) {
            setPlayerHealth(0);
            dispatch({
                position: "topR",
                type: "warning",
                title: "failed",
                message: "you have been defeated"
            });
        }
    }
        const skillAttack=(Index)=>{
            if(Inventory.skills[Index].name=="vaccum palm"&&playerQi>=10&&playerHealth>0&&npcHealth>0){
              if(levelToValue[playerLevel]>=levelToValue[npc.level]){
                setNpcHealth(prev=>Math.max(prev - ((levelToValue[playerLevel]-levelToValue[npc.level])*200 - npcDefence), 0));
                setPlayerQi(prev=>prev-10);
              }
              else{
                setPlayerHealth(prev=>Math.max(prev - ((levelToValue[npc.level]-levelToValue[playerLevel])*200 - playerDefence), 0));
                setPlayerQi(prev=>prev-10);
              }
            }
            if(Inventory.skills[Index].name=="octane blast"&&playerQi>=20&&playerHealth>0&&npcHealth>0){
                  const trueDamage=playerQi*10;
                  if(npcHealth>trueDamage){
                    setNpcHealth(prev=>Math.max(prev-((Math.floor(trueDamage/2)-npcDefence)),0))
                    setPlayerHealth(prev=>Math.max(prev-(npcAttack-playerDefence),0));
                    setPlayerQi(prev=>prev-20);
                  }
                  else{
                       setNpcHealth(0);
                       setPlayerQi(prev=>prev-20);

                  }
              }
              if(Inventory.skills[Index].name=="fire blaze"&&playerHealth>0&&npcHealth>0){
               dispatch({
                position:"topR",
                message:"weak flame right now",
                title:"sorry",
                type:"warning"
               })
              }
              if(playerHealth==0){
                dispatch({
                    position:"topR",
                    message:"already defeated,refresh",
                    title:"sorry",
                    type:"warning"
                   })
              }
              if(npcHealth==0){
                dispatch({
                    position:"topR",
                    message:"already defeated",
                    title:"literally",
                    type:"success"
                   })
              }
        }
        
        const fetchdatabases = async () => {
            try {
                const q = query(collection(db, "players"), where("account", "==", account));
                const querySnapshot = await getDocs(q);
                const userData = querySnapshot.docs.map(doc=>doc.data());
                setInventoryData(userData[0]);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
          
          }
          const handleFinalSubmission=async()=>{
            if(checkQuest==false){
            await runContractFunction({
                params:{
                   abi:ContractAbi,
                   contractAddress:btthAddress,
                   functionName:"characterUpdate",
                   params:{
                    questIndex: 3,
                    level: "four star dou zhi",
                    Index: 0,
                    Maxhealth: 800,
                    health: playerHealth,
                    attackDamage: Number(playerDamage)+30,
                    defense: Number(playerDefence)+10,
                    weapon: "none",
                    qi: playerQi,
                    maxQi: Number(Character.maxQi.toString())+20,
                   },
                },
                onSuccess:handleSuccessQ3,
                onError:(error)=>{
                    console.log(error);
                }
            })
          }
          else{
             router.push("quest4");
          }
        }
        const handleSuccessQ3=async(tx)=>{
            await tx.wait(1);
         const newGoldcoin=invData.goldcoin+40000;
         dispatch({
            position:"topR",
            title:"congratulation",
            message:`gold is going to update with ${newGoldcoin}`,
            type:"success"
        })
         const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, { goldcoin: newGoldcoin});
            router.push("quest4");
        }
        else{
            console.log("no data sry");
        }
    }
    const handleGoNext=()=>{
        router.push('quest4')
      }
      const handleGoPrev=()=>{
        router.push('quest2')
      }
    return (
        <div className='flex flex-col items-center mt-3 bg-pink-900'>
         
            <div className="relative w-full max-w-screen-lg">
                {Array.from({ length: 12 }).map((_, index) => (
                    <Image
                        key={index}
                        src={`/image-quest3-${index}.jpg`}
                        layout="responsive"
                        width={1900}
                        height={800}
                        objectFit="cover"
                        alt={`Chapter 3 Image ${index}`}
                        className="rounded-md mb-4"
                    />
                ))}
            </div>
            {!checkQuest?
            <quest>
                <div>
                    <Card>
                        <p className='m-2 text-xl text-stone-900'>It is quest time!</p>
                        <p className='m-2 text-xl'>Upon passing through market jia lie tries tease xun er, upon arrival of xiao clan's army he tries to provoke you</p>
                        <p className='m-2 text-xl text-red-800'>you are not weak you have to accept the challenge!</p>
                        {!visible &&
                            <div className="flex justify-center m-2">
                                <button onClick={handleClickMe} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                                    Accept Challenge
                                </button>
                            </div>
                        }
                        {visible && Character && (
                            <div className='flex flex-col'>
                            <div className=' flex flex-row  w-auto'>
                                <Card>
                                    <div className='flex flex-col items-center'>
                                        <div className=' m-1 text-2xl text-indigo-900'> your hero</div>
                                        <Image src="/xiaoYan.jpg" width={200} height={300} className="w-32 h-32 mb-4" />
                                        <p className='text-xl text-slate-700 m-1'> max Hp ❣️ :  {Character.maxHealth.toString()}</p>
                                        <p className='text-xl text-slate-700 m-1'> health ❣️ :  {playerHealth}</p>
                                        <p className='text-xl text-slate-700 m-1'> Defence 🛡️ : {playerDefence}</p>
                                        <p className='text-xl text-slate-700 m-1'> Qi  : {playerQi}</p>
                                        <p className='text-xl text-slate-700 m-1'> MaxQi  : {Character.maxQi.toString()}</p>
                                        <p className='text-xl text-slate-700 m-1'> level  : {playerLevel}</p>
                                        <p className='text-xl text-slate-700 m-1'> weapon  : {Character.weapon}</p>
                                        <p className='text-xl text-slate-700 m-1'> damage ⚔️ : {playerDamage}</p>
                                    </div>
                                </Card>
                                <Card className='mt-4'>
                              <div className='flex flex-col items-center'>
                                <div className=' m-1 text-2xl text-red-700'>Jia lie Ao</div>
                                <Image src="/jia-lie-ao.jpg" width={200} height={300} className="w-32 h-32 mb-4" alt="NPC" />
                                <p className='text-xl text-slate-700 m-1'>  Level: {npc.level}</p>
                                <p className='text-xl text-slate-700 m-1'>  Max Hp ❣️: {npc.maxHealth}</p>
                                <p className='text-xl text-slate-700 m-1'>  Hp ❣️: {npcHealth}</p>
                                <p className='text-xl text-slate-700 m-1'>  Damage ⚔️: {npc.attackDamage}</p>
                                <p className='text-xl text-slate-700 m-1'>  defense 🛡️: {npc.defense}</p>
                            </div>
                            </Card>
                            </div>
                            <div className='flex flex-row justify-center m-2'>
                                <div className=' m-1'>
                            <button 
                              onClick={handleAttack}
                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300 ease-in-out">
                                            Normal Attack
                            </button>
                            </div>
                            <Select
                    options={Inventory.skills.map((skill, index) => ({
                        id: index,
                        label: skill.name
                    }))}
                    onChange={(selectedOption) => { setSelectedSkillIndex(selectedOption.id); }}
                    className="py-2 px-4 rounded"
                />
                <button
                      onClick={() => skillAttack(selectSkillIndex)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                    Use Skill
                </button>
                            </div>
                            </div>
                        )}
                        {playerHealth>0&&npcHealth==0&&(
                            <div className="flex justify-center my-4 mt-10">
                            <button onClick={handleFinalSubmission}className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out shadow-lg transform hover:scale-105">
                                Claim Prize
                            </button>
                        </div>
                        )}
                    </Card>

                   
                </div>
                
            </quest>
            :( <div class='flex flex-col items-center'>
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
        </div>)}
        </div>
    );
}
