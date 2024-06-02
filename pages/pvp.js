import Image from "next/image";
import { Card, Form, Button, Input, Select } from "web3uikit";
import Link from "next/link";
import levelToValue from "../constants/lvtoValueatLg.mjs";
import pvpmap from "../constants/pvpAddress.json";
import pvpAbi from "../constants/pvpAbi.json";
import btthmap from "../constants/btthAddress.json";
import btthAbi from "../constants/btthAbi.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from 'web3uikit';
import { useEffect, useState } from "react"; 
import {db} from "./firebaseConfig";
import {collection,addDoc, query, where, getDocs, updateDoc} from "firebase/firestore";
export default function PVP() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const [opponent, setOpponent] = useState("");
    const [arrayData,setArrayData]=useState(null);
    const [invData, setInventoryData] = useState(null);
    const [invOpponentData,setInventoryOpponentData]=useState(null);
    const [character, setCharacter] = useState(null);
    const [matchInfo,setMatchInfo]=useState(null);
    const [inventory,setInventory]=useState(null);
    const [checkPvPactive,setCheckPvPactive]=useState(false);
    const { runContractFunction } = useWeb3Contract();
    const chainString = chainId ? parseInt(chainId).toString() : "80002";
    const pvpAddress = pvpmap[chainString]?.pvpBattle[0];
    const btthAddress=btthmap[chainString]?.btthGame[0];
    const dispatch = useNotification();
     const[selectSkillIndex,setSelectedSkillIndex]=useState(0);
     useEffect(() => {
        fetchdatabases()
        setUpUi4();
        setUpUi3();
        setUpUi1();
        setUpUi2();
        setUpUi5();
         
        const intervalId = setInterval(() => {
            fetchdatabases()
            setUpUi3();
            setUpUi1();
            setUpUi2();
            setUpUi4();
            setUpUi5();
        }, 1000); // Executes every 1000 milliseconds (1 second)
    
        // Cleanup function to clear the interval when the component unmounts or dependencies change
        return () => clearInterval(intervalId);
    }, [account]); // Empty dependency array means this useEffect runs only once when the component mounts
    
    const setUpUi1 = async () => {
        const setlist = await runContractFunction({
            params: {
                abi: pvpAbi,
                contractAddress: pvpAddress,
                functionName: "retrieveChallengeList",
            },
        });
        if (setlist) {
            setArrayData(setlist);
        }
    };
    const fetchdatabases = async () => {
        try {
            const q = query(collection(db, "pvp"), where("account", "==", account));
            const querySnapshot = await getDocs(q);
            const userData = querySnapshot.docs.map(doc=>doc.data());
            setInventoryData(userData[0]);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
      
      }
      const handleRefresh=async()=>{
        await setUpUi2();
        await setUpUi4();
        if(matchInfo.match_goingOn==false){
        const newMaxhp=Number(character.maxHealth.toString())
        const newhp=Number(character.health.toString());
        const newLevel=character.level;
        const newDefense=Number(character.defense.toString());
        const newAttackDamage=Number(character.attackDamage.toString());
        const newWeapon=character.weapon;
        const newQi=Number(character.qi.toString());
        const newmaxQi=Number(character.maxQi.toString());
        const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
                maxHp:newMaxhp,
                hp:newhp,
                level:newLevel,
                attackDamage:newAttackDamage,
                defence:newDefense,
                qi:newQi,
                maxQi:newmaxQi,
                weapon:newWeapon,
                isYourChance:false

             });
             fetchdatabases();
            
          } else {
            console.log("No document found for the provided account");
          }
        }
        else{
            dispatch({
                position:"topR",
                title:"sorry",
                message:"defeat opponent first",
                type:"warninig"
            })
        }
      }
    const setUpUi2=async()=>{
       const setList=await runContractFunction({
        params:{
                abi:btthAbi,
                contractAddress:btthAddress,
                functionName:"getCharacterDetails",

            params:{
               to:account,
            },
        }
       })
       if(setList){
        setCharacter(setList)
       }
    }
    
     const setUpUi3=async()=>{
         const setMe=await runContractFunction({
           params:{ 
            abi: pvpAbi,
            contractAddress: pvpAddress,
            functionName: "retrieveIsStarted"
           },

         })
         if(setMe){
            setCheckPvPactive(setMe);
         }
     }
     const setUpUi4=async()=>{
        const setMe=await runContractFunction({
            params:{
                abi:pvpAbi,
                contractAddress:pvpAddress,
                functionName:"retrieveMatchInfoReceipt",
                params:{
                    to:account
                }
            }
        })
        if(setMe){
       setMatchInfo(setMe);
        }
     }
     const setUpUi5=async()=>{
        const set1=await runContractFunction({
            params:{abi:btthAbi,
            contractAddress:btthAddress,
            functionName:"getInventory",
            params:{
                to:account,
            },
            },
        })
        if(set1){
        setInventory(set1);
        }
     }
    const handleChallenge = async () => {
        await runContractFunction({
            params: {
                abi: pvpAbi,
                contractAddress:pvpAddress,
                functionName: "ragister",
                params: {
                    opponent: opponent
                }
            },
            onSuccess: handleSuccess,
            onError: (error) => handleError(error)
        });
    };
    const handleSuccess = async(tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Challenge sent successfully!",
            title: "Challenge Success",
            position: "topR"
        });
    };

    const handleError = (error) => {
        dispatch({
            type: "error",
            message: error.message,
            title: "Challenge Failed",
            position: "topR"
        });
    };

    const handleAcceptChallenge = async (challenger,index) => {
       await runContractFunction({
            params: {
                abi: pvpAbi,
                contractAddress: pvpAddress,
                functionName: "challengAccept",
                params: {
                    Index: index
                }
            },
            onSuccess:()=> handleAcceptSuccess(challenger,index),
            onError: (error) => handleError(error)
        });
    };

    const handleAcceptSuccess = async (challenger,index) => {
         const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
         if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docRef = doc.ref;
          await updateDoc(docRef, {
            opponenet:challenger[index]
           }); 
           };
           const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", challenger[index].toLowerCase())));
           if (!querySnapshot1.empty) {
            const doc = querySnapshot1.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
              isYourChance:true,
              opponenet:account
            }); 
         
            dispatch({
                position:"topR",
                title:"done",
                type:"success",
                message:"you succesfully accepted challenge"
            })
        }
        else{
            console.log("you got nothing")
        }
            fetchdatabases();


}

/*                                                 */
//main logic
      
 const handlePlacingOpponent=async()=>{
    try {
        const q = query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase()));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc=>doc.data());
        setInventoryOpponentData(userData[0]);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
 }

 const handleAttack=async()=>{
   await handlePlacingOpponent()
   if(invData.isYourChance==true&&invData.hp>0&&invOpponentData.hp>0){
       if(invData.weapon=="none"){
        const Damage=Math.round(Math.random()*invData.attackDamage);
        const totalDamage=Damage;
        const remaininghealth=Math.max(invOpponentData.hp-Math.max(totalDamage-Math.round(Math.random()*invOpponentData.defence),0),0);
        const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
         if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docRef = doc.ref;
          await updateDoc(docRef, {
            isYourChance:false
           }); 
           };
           const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase())));
           if (!querySnapshot1.empty) {
            const doc = querySnapshot1.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
              isYourChance:true,
              hp:remaininghealth
            }); 
        
       }
    }
    else{
        const trueDamage=levelToValue[invData.level]*5;
        const Damage=Math.round(Math.random()*invData.attackDamage);
        const totalDamage=Damage+trueDamage;
        const remaininghealth=Math.max(invOpponentData.hp-Math.max(totalDamage-Math.round(Math.random()*invOpponentData.defence),0),0);
        const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
         if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docRef = doc.ref;
          await updateDoc(docRef, {
            isYourChance:false
           }); 
           };
           const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase())));
           if (!querySnapshot1.empty) {
            const doc = querySnapshot1.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
              isYourChance:true,
              hp:remaininghealth
            }); 
        
       }
    }
    await handlePlacingOpponent()
    dispatch({
        position:"topR",
        title:"congratultion",
        message:"you have attacked wait for chance",
        type:"success"
    })
 
   }
   else{
          console.log("what");
   }
   
 }
 const skillAttack=async(Index)=>{
   await handlePlacingOpponent();
   if(inventory.skills[Index].name=="vaccum palm"&&invData.qi>=10&&invData.hp>0&&invOpponentData.hp>0&&invData.isYourChance==true){
    if(levelToValue[invData.level]>levelToValue[invOpponentData.level]){
       const damage=(levelToValue[invData.level]-levelToValue[invOpponentData.level])*Math.round(Math.random()*100);
       
       const remaininghealth=Math.max(invOpponentData.hp-damage,0);
       const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
         if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docRef = doc.ref;
          await updateDoc(docRef, {
            isYourChance:false,
            qi:invData.qi-10
           }); 
           };
           const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase())));
           if (!querySnapshot1.empty) {
            const doc = querySnapshot1.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
              isYourChance:true,
              hp:remaininghealth
            }); 
        
       }
    }
    else{
        const damage=(levelToValue[invOpponentData.level]-levelToValue[invData.level])*Math.round(Math.random()*100);
        const remaininghealth=Math.max(invOpponentData.hp-damage,0);
        const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
        if (!querySnapshot.empty) {
         const doc = querySnapshot.docs[0];
         const docRef = doc.ref;
         await updateDoc(docRef, {
           isYourChance:false,
           hp:remaininghealth,
           qi:invData.qi-10
          }); 
          };
          const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase())));
          if (!querySnapshot1.empty) {
           const doc = querySnapshot1.docs[0];
           const docRef = doc.ref;
           await updateDoc(docRef, {
             isYourChance:true,
           }); 
      }
    }
   }
   if(inventory.skills[Index].name=="octane blast"&&invData.qi>=20&&invData.hp>0&&invOpponentData.hp>0&&invData.isYourChance==true){
           const trueDamage=invData.qi*10;
           const remaininghealth=Math.max(invOpponentData.hp-Math.round(trueDamage*Math.random()),0);
           const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
           if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
              isYourChance:false,
              qi:invData.qi-20
             }); 
             };
             const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase())));
             if (!querySnapshot1.empty) {
              const doc = querySnapshot1.docs[0];
              const docRef = doc.ref;
              await updateDoc(docRef, {
                hp:remaininghealth,
                isYourChance:true,
              }); 
         } 
   }
   if(inventory.skills[Index].name=="fire blaze"&&invData.hp>0&&invOpponentData.hp>0&&invData.isYourChance==true){
       const trueDamage=inventory.flames.length*100;
       const remaininghealth=Math.max(invOpponentData.hp-Math.round(trueDamage*Math.random()),0);
           const querySnapshot = await getDocs(query(collection(db, "pvp"), where("account", "==", account)));
           if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {
              isYourChance:false,
             }); 
             };
             const querySnapshot1 = await getDocs(query(collection(db, "pvp"), where("account", "==", invData.opponenet.toLowerCase())));
             if (!querySnapshot1.empty) {
              const doc = querySnapshot1.docs[0];
              const docRef = doc.ref;
              await updateDoc(docRef, {
                hp:remaininghealth,
                isYourChance:true,
              }); 
         } 
   }

  }
  const handleClaimPrize=async()=>{
    await runContractFunction({
        params:{
             abi:pvpAbi,
             contractAddress:pvpAddress,
             functionName:"updateStatusPlayer",
                
            params:{
              winner:account,
              looser:invData.opponenet  
            }
        },
        onSuccess:handleFinalSuccess,
    })

  }
  const handleFinalSuccess=async(tx)=>{
    await tx.wait(1);
    dispatch({
        position:"topR",
        title:"congratulation",
        type:"success",
        message:"successfully done"
    })
  }


//
    return (
        <div className="bg-violet-950 min-h-screen flex flex-col items-center py-10">
            {checkPvPactive.isPvPactive?
            <Card>
            <div className="flex justify-center mt-5">
                
                    <div className="flex flex-col">
                        <p className="text-xl">This is PVP section where you can challenge anyone in the game!</p>
                        <p className="text-3xl text-center m-2 text-red-900">Important</p>
                        <p className="text-xl text-slate-700 mt-2">1️⃣ You can either challenge or accept a challenge.</p>
                        <p className="text-xl text-slate-700 mt-2">2️⃣ If you challenge someone and they accept, your turn will be at the start.</p>
                    </div>
                
            </div>
            <div className="flex  flex-col items-center">
            <div className=" text-2xl text-center mt-5 text-fuchsia-950">
                    Challenge
                </div>
            <div className="text-xl mt-2">⚔️⚔️⚔️⚔️⚔️⚔️⚔️</div>
            <div className="flex flex-row mt-6 space-x-4 w-2/5">
    <input
        type="text"
        placeholder="Opponent Address"
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        className="flex-grow p-2 rounded-lg border border-gray-300 shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
        onClick={handleChallenge}
        className="px-4 py-2 rounded-lg bg-gray-700 text-white font-bold transition duration-300 hover:bg-gray-800"
    >
        Send Challenge
    </button>
         </div>
        {invData&&(
         <div className=" mt-6"> 
            <Card className="border rounded-lg shadow-lg p-4 bg-white">
            <div className="flex flex-col items-center border rounded-lg shadow-lg p-4 bg-white">
  <p className="text-2xl font-bold text-gray-800 m-2">Xiao Yan</p>
  <Image 
    src="/XiaoYan.webp" 
    width={250} 
    height={80} 
    alt="Xiao Yan" 
    className="rounded-md"
  />
  <div className="flex flex-col items-center mt-4">
    <p className="text-lg text-gray-600">Max HP 💚: {invData.maxHp}</p>
    <p className="text-lg text-gray-600">HP 💚: {invData.hp}</p>
    <p className="text-lg text-gray-600">Level 🔼: {invData.level}</p>
    <p className="text-lg text-gray-600">Attack ⚔️: {invData.attackDamage}</p>
    <p className="text-lg text-gray-600">Defence 🛡️: {invData.defence}</p>
    <p className="text-lg text-gray-600">Qi: {invData.qi}</p>
    <p className="text-lg text-gray-600">Max Qi: {invData.maxQi}</p>
    <p className="text-lg text-gray-600">Weapon: {invData.weapon}</p>
  </div>
  <div className="mt-4">
    <button onClick={handleRefresh} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
      Refresh
    </button>
  </div>
</div>

</Card>


         </div>
        )}
         {arrayData&&arrayData.length>0&&(
          <div className="p-4">
          {arrayData.map((challenger, index) => (
            <div key={index} className="flex items-center justify-between mb-2 p-2 border rounded-md">
              <span className="mr-4 text-xl font-serif">You are challenged by: {challenger}</span>
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                onClick={() => handleAcceptChallenge(challenger,index)}
              >
                Accept Challenge
              </button>
            </div>
          ))}
        </div>
         )}
         {matchInfo&&matchInfo.match_goingOn&&invOpponentData&&(
            <div className=" items-center m-2">
            <Card>
         <div className="flex flex-row">
         <div className="m-2">
             <Card className="bg-white rounded-lg shadow-md p-4">
                 <div className="flex flex-col items-center">
                     <p className="text-xl font-bold">Your Hero</p>
                     <Image src="/IMG_0792.webp" width={190} height={80} className="mt-2" />
                     <p className="text-lg text-gray-600">Max HP 💚: {invData.maxHp}</p>
    <p className="text-lg text-gray-600">HP 💚: {invData.hp}</p>
    <p className="text-lg text-gray-600">Level 🔼: {invData.level}</p>
    <p className="text-lg text-gray-600">Attack ⚔️: {invData.attackDamage}</p>
    <p className="text-lg text-gray-600">Defence 🛡️: {invData.defence}</p>
    <p className="text-lg text-gray-600">Qi: {invData.qi}</p>
    <p className="text-lg text-gray-600">Max Qi: {invData.maxQi}</p>
    <p className="text-lg text-gray-600">Weapon: {invData.weapon}</p>
                 </div>
             </Card>
         </div>
         <div className="m-2">
             <Card className="bg-white rounded-lg shadow-md p-4">
           
                 <div className="flex flex-col items-center">
                 <p className="text-xl font-bold">enemy Hero</p>
                    <Image
                     src="/XiaoYanCover.webp"
                     width={155} height={60} className="mt-2"
                    />
                    <p className="text-lg text-gray-600">Max HP 💚: {invOpponentData.maxHp}</p>
    <p className="text-lg text-gray-600">HP 💚: {invOpponentData.hp}</p>
    <p className="text-lg text-gray-600">Level 🔼: {invOpponentData.level}</p>
    <p className="text-lg text-gray-600">Attack ⚔️: {invOpponentData.attackDamage}</p>
    <p className="text-lg text-gray-600">Defence 🛡️: {invOpponentData.defence}</p>
    <p className="text-lg text-gray-600">Qi: {invOpponentData.qi}</p>
    <p className="text-lg text-gray-600">Max Qi: {invOpponentData.maxQi}</p>
    <p className="text-lg text-gray-600">Weapon: {invOpponentData.weapon}</p>
                 </div>
             </Card>
         </div>
     </div>
     <div className="flex flex-row justify-center">
    <button onClick={handleAttack} className="bg-blue-500 mx-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
        Normal Attack
    </button>
    <Select
                    options={inventory.skills.map((skill, index) => ({
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
     </Card>
     </div>
         )}
              {!invOpponentData&&matchInfo&&matchInfo.match_goingOn&&(
                <div className=" m-3">
                <button onClick={handlePlacingOpponent}  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Summon
            </button>
            </div>
              )}
              {invOpponentData&&invOpponentData.hp==0&&(
                <button onClick={handleClaimPrize}class="bg-pink-500 text-white font-bold py-2 px-4 rounded hover:bg-pink-700">
                claim prize
              </button>
              
              )}
              <div className=" text-9xl text-center invisible text-red-900">
          end
     </div>
         </div>
           
       </Card>
       :(<div className=" mt-2 text-center text-5xl text-red-900">
          Locked !! complete quest2 and active it from main menu
        </div>
    )
}
        </div>
    );
}
