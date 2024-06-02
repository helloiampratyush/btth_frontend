import Image from "next/image";
import { Card,Form } from "web3uikit";
import Link from "next/link";
import networkMapping from "../constants/btthAddress.json";
import ContractAbi from "../constants/btthAbi.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from 'web3uikit';
import {db} from "../constants/firebaseConfig";
import {collection,addDoc, query, where, getDocs, updateDoc} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
async function saveToFireStore(account,goldcoin,healthPotion,qiPill,armourEnhancePotion,attackEnhancePotion,QiLimitEnhancePotion){
  try{
    const docRef=await addDoc(collection(db,"players"),{
      account:account,
      goldcoin:goldcoin,
      healthPotion:healthPotion,
      qiPill:qiPill,
      armourEnhancePotion:armourEnhancePotion,
      attackEnhancePotion:attackEnhancePotion,
      QiLimitEnhancePotion:QiLimitEnhancePotion
    });
    console.log("added successfully");
  }catch(error){
    console.log(error);
    console.log("false");
  }
}

export default function Home() {
  const { chainId, account,isWeb3Enabled } = useMoralis();
  const [invData,setInventoryData]=useState(null);
  const { runContractFunction } = useWeb3Contract();
  const chainString = chainId ? parseInt(chainId).toString() : "80002";
  const btthAddress = networkMapping[chainString]?.btthGame[0]; // 
  const dispatch=useNotification();
  const router=useRouter();
  const handleCharacter= async () => {
    const game = {
        abi: ContractAbi,
        contractAddress: btthAddress,
        functionName: "newGame",
       
    };
    await runContractFunction({
        params: game,
        onSuccess: handleCharacterSuccess,
        onError: (error) => console.log(error),
    });
};
  const handleCharacterSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
        type: "success",
        message: "Character created",
        title: "hello",
        position: "topR",
    })

  const added=await saveToFireStore(account,10000,0,0,0,0,0);
  
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

const handlePotionSale=async(potionCost,potionName)=>{
  if(invData.goldcoin>=potionCost&& potionName=="healthPotion"){
    const newGoldcoin=invData.goldcoin-potionCost;
    const newHealthPotion=invData.healthPotion+1;
    const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, { goldcoin: newGoldcoin,healthPotion:newHealthPotion });
            dispatch({
              position:"topR",
              type:"success",
              title:"congratulation",
              message:"successfully bought health potion"
            })
          } else {
            dispatch({
              position:"topR",
              type:"error",
              title:"warning",
              message:"no doc"
            })
          }
    
  }
  else if(invData.goldcoin>=potionCost&& potionName=="qiPill"){
    const newGoldcoin=invData.goldcoin-potionCost;
    const newqiPill=invData.qiPill+1;
    const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, { goldcoin: newGoldcoin,qiPill:newqiPill});
            dispatch({
              position:"topR",
              type:"success",
              title:"congratulation",
              message:"successfully bought qi pill"
            })
             
          } else {
            console.log("No document found for the provided account");
          }
    
  }
  
 else  if(invData.goldcoin>=potionCost&& potionName=="armour Enhance Potion"){
    const newGoldcoin=invData.goldcoin-potionCost;
    const newArmourPotion=invData.armourEnhancePotion+1;
    const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, { goldcoin: newGoldcoin,armourEnhancePotion:newArmourPotion});
            dispatch({
              position:"topR",
              type:"success",
              title:"congratulation",
              message:"successfully bought armour enhance potion"
            })
             
          } else {
            console.log("No document found for the provided account");
          }
    
  }
 else if(invData.goldcoin>=potionCost&& potionName=="Attack Enhance Potion"){
    const newGoldcoin=invData.goldcoin-potionCost;
    const newAttackPotion=invData.attackEnhancePotion+1;
    const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, { goldcoin: newGoldcoin,attackEnhancePotion:newAttackPotion});
            dispatch({
              position:"topR",
              type:"success",
              title:"congratulation",
              message:"successfully bought attck enhance potion"
            })
             
          } else {
            console.log("No document found for the provided account");
          }
    
  }
 else if(invData.goldcoin>=potionCost&& potionName=="Qi Limit Enhance Potion"){
    const newGoldcoin=invData.goldcoin-potionCost;
    const newQiEnhancePotion=invData.QiLimitEnhancePotion+1;
    const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, { goldcoin: newGoldcoin,QiLimitEnhancePotion:newQiEnhancePotion});
            dispatch({
              position:"topR",
              type:"success",
              title:"congratulation",
              message:"successfully bought qi limit enhance potion"
            })
             
          } else {
            console.log("No document found for the provided account");
          }
    
  }
  else {
    dispatch({
      position:"topR",
      type:"error",
      title:"warning",
      message:"no gold coin no offering"
    })
  }
}
const handlePlay=async()=>{
  await fetchdatabases();
  if(invData){
    router.push('mainMenu')
  }
  else{
    dispatch({
      title:"hello",
      message:"create your character",
      type:"warning",
      position:"topR"
    })
  }
}

useEffect(()=>{fetchdatabases();},[handlePotionSale])
  return (
    <div className="bg-purple-900 min-h-screen p-4">
      <p className="text-3xl md:text-4xl font-serif text-center mt-2">Battle Through Heavens web3 RPG Game</p>
      <div className="flex justify-center">
        <Image className="mt-5" width="300" height="300" src="/btth_thumbnail.jpg" alt="Game Thumbnail" />
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center mt-5">
        <button onClick={handleCharacter} className="m-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
          Create Character
        </button>
        <button onClick={handlePlay}className="m-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
          Play Game
        </button>
      </div>
 {invData?
      <div className="m-4">
        <div className="text-2xl md:text-3xl font-mono text-center">General Store</div>
        <div className="flex flex-wrap justify-center mt-4">
          <Card className="p-4">
            <div className=" text-center m-2 text-2xl text-amber-900">
             your available goldcoin 💰 : {invData.goldcoin}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="flex flex-col items-center m-3">
                <Image src="/healthPotion.png" height="100" width="100" alt="Health Potion" />
                <div className="text-green-700 text-lg md:text-2xl">Health Potion</div>
                <div className="text-violet-800 text-lg md:text-2xl">Cost: 10000 Gold</div>
                <button onClick={() => handlePotionSale(10000, "healthPotion")} className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">Buy</button>

              </div>
              <div className="flex flex-col items-center m-3">
                <Image src="/qiPill.png" height="100" width="100" alt="Qi Pill" />
                <div className="text-green-700 text-lg md:text-2xl">Qi Pill</div>
                <div className="text-violet-800 text-lg md:text-2xl">Cost: 10000 Gold</div>
                <button onClick={() => handlePotionSale(10000, "qiPill")} className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out" >Buy</button>
              </div>
              <div className="flex flex-col items-center m-3">
                <Image src="/revive.jpg" height="100" width="100" alt="Revive Potion" />
                <div className="text-green-700 text-lg md:text-2xl">armour Enhance Potion</div>
                <div className="text-violet-800 text-lg md:text-2xl">Cost: 100000 Gold</div>
                <button onClick={() => handlePotionSale(100000, "armour Enhance Potion")} className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">Buy</button>
              </div>
              <div className="flex flex-col items-center m-3">
                <Image src="/attackEnhancePotion.png" height="100" width="100" alt="Attack Enhance Potion" />
                <div className="text-green-700 text-lg md:text-2xl">Attack Enhance Potion</div>
                <div className="text-violet-800 text-lg md:text-2xl">Cost: 1000000 Gold</div>
                <button onClick={() => handlePotionSale(1000000, "Attack Enhance Potion")} className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">Buy</button>
              </div>
              <div className="flex flex-col items-center m-3">
                <Image src="/goldDropEnhancePotion.jpg" height="100" width="100" alt="QiLimitEnhancePotion" />
                <div className="text-green-700 text-lg md:text-2xl">Qi Limit Enhance Potion</div>
                <div className="text-violet-800 text-lg md:text-2xl">Cost: 1000000 Gold</div>
                <button onClick={() => handlePotionSale(1000000, "Qi Limit Enhance Potion")} className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">Buy</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      :(<div  className=" mt-5">  
        <div className=" text-3xl text-red-900 text-center">
 
please create your character first, store is lock🔒
          </div>
         </div>)}
    </div>
  );
}
