import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../constants/btthAddress.json';
import ContractAbi from '../constants/btthAbi.json';
import { useNotification, Card } from 'web3uikit';
import Image from 'next/image';
import { db } from '../constants/firebaseConfig';
import {getDocs, query, collection, where, updateDoc, doc } from "firebase/firestore";

export default function Character() {
    const { chainId, account } = useMoralis();
    const { runContractFunction } = useWeb3Contract();
    const [character, setCharacter] = useState(null);
    const [inventory, setInventory] = useState(null);
    const [invData, setInventoryData] = useState(null);
    const chainString = chainId ? parseInt(chainId).toString() : '80002';
    const btthAddress = networkMapping[chainString]?.btthGame[0];
    const dispatch = useNotification();

    useEffect(() => {
        fetchdatabases();
        fetchCharacterDetails();
        fetchInventoryDetails();

        const intervalId = setInterval(() => {
            fetchCharacterDetails();
            fetchInventoryDetails();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchCharacterDetails = async () => {
        try {
            const characterData = await runContractFunction({
                params: {
                    contractAddress: btthAddress,
                    abi: ContractAbi,
                    functionName: 'getCharacterDetails',
                    params: {
                        to: account,
                    }
                },
            });
            setCharacter(characterData);
        } catch (error) {
            console.error('Error fetching character details:', error);
            dispatch({ type: 'ERROR', message: 'Error fetching character details' });
        }
    };

    const fetchdatabases = async () => {
        try {
            const q = query(collection(db, "players"), where("account", "==", account));
            const querySnapshot = await getDocs(q);
            const userData = querySnapshot.docs.map(doc => doc.data());
            setInventoryData(userData[0]);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchInventoryDetails = async () => {
        try {
            const inventoryData = await runContractFunction({
                params: {
                    contractAddress: btthAddress,
                    abi: ContractAbi,
                    functionName: 'getInventory',
                    params: {
                        to: account,
                    }
                },
            });
            setInventory(inventoryData);
        } catch (error) {
            console.error('Error fetching inventory details:', error);
            dispatch({ type: 'ERROR', message: 'Error fetching inventory details' });
        }
    };
         const handleUsePotion=async(potionName)=>{
            await fetchdatabases();
            if(potionName=="health potion"&&invData.healthPotion>=1){
                await runContractFunction({
                    params:{
                    contractAddress:btthAddress,
                    abi:ContractAbi,
                    functionName:'characterUpdate',
                    params:{
                        questIndex:0,
                        level:character.level,
                        Index:0,
                        Maxhealth:character.maxHealth.toString(),
                        health:character.maxHealth.toString(),
                        attackDamage:character.attackDamage.toString(),
                        defense:character.defense.toString(),
                        weapon:character.weapon,
                        qi:character.qi.toString(),
                        maxQi:character.maxQi.toString()
                    },
                },
                    onSuccess:()=>{
                        console.log(potionName);
                        handleSucces(potionName)},

                    onError:(error)=>console.log(error),
               

                })
                
            }
           else if(potionName=="qi Pill"&&invData.qiPill>=1){
                await runContractFunction({
                    params:{
                    contractAddress:btthAddress,
                    abi:ContractAbi,
                    functionName:'characterUpdate',
                    params:{
                        questIndex:0,
                        level:character.level,
                        Index:0,
                        Maxhealth:character.maxHealth.toString(),
                        health:character.health.toString(),
                        attackDamage:character.attackDamage.toString(),
                        defense:character.defense.toString(),
                        weapon:character.weapon,
                        qi:character.maxQi.toString(),
                        maxQi:character.maxQi.toString()
                    },
                },
                    onSuccess:()=>handleSucces(potionName),

                    onError:(error)=>console.log(error),
               

                })
                
            }
          else  if(potionName=="armour potion"&&invData.armourEnhancePotion>=1){
                await runContractFunction({
                    params:{
                    contractAddress:btthAddress,
                    abi:ContractAbi,
                    functionName:'characterUpdate',
                    params:{
                        questIndex:0,
                        level:character.level,
                        Index:0,
                        Maxhealth:character.maxHealth.toString(),
                        health:character.health.toString(),
                        attackDamage:character.attackDamage.toString(),
                        defense:Number(character.defense.toString())+(Math.round(Number(character.defense.toString())/4)),
                        weapon:character.weapon,
                        qi:character.qi.toString(),
                        maxQi:character.maxQi.toString()
                    },
                },
                    onSuccess:()=>handleSucces(potionName),

                    onError:(error)=>console.log(error),
                

                })
                
            }
            
          else  if(potionName=="attack enhance"&&invData.attackEnhancePotion>=1){
                await runContractFunction({
                    params:{
                    contractAddress:btthAddress,
                    abi:ContractAbi,
                    functionName:'characterUpdate',
                    params:{
                        questIndex:0,
                        level:character.level,
                        Index:0,
                        Maxhealth:character.maxHealth.toString(),
                        health:character.health.toString(),
                        attackDamage:Number(character.attackDamage.toString())+Math.round(Number(character.attackDamage.toString())/2),
                        defense:character.defense.toString(),
                        weapon:character.weapon,
                        qi:character.qi.toString(),
                        maxQi:character.maxQi.toString()
                    },
                },
                    onSuccess:()=>handleSucces(potionName),

                    onError:(error)=>console.log(error),
                

                })
                
            }
            else if(potionName=="Qi Limit Enhance"&&invData.QiLimitEnhancePotion>=1){
                await runContractFunction({
                    params:{
                    contractAddress:btthAddress,
                    abi:ContractAbi,
                    functionName:'characterUpdate',
                    params:{
                        questIndex:0,
                        level:character.level,
                        Index:0,
                        Maxhealth:character.maxHealth.toString(),
                        health:character.health.toString(),
                        attackDamage:character.attackDamage.toString(),
                        defense:character.defense.toString(),
                        weapon:character.weapon,
                        qi:character.qi.toString(),
                        maxQi:Number(character.maxQi.toString())+Math.floor(Number(character.maxQi.toString())/2)
                    },
                },
                    onSuccess:()=>handleSucces(potionName),

                    onError:(error)=>console.log(error),
                

                })
                
            }
            else{
               
                    dispatch({
                        type: "error",
                        message: "you got 0 potion buddy",
                        title: "warning",
                        position: "topR",
                    })
            }
         }
         const handleSucces=async(potionName)=>{
            if(potionName=="health potion"){
                dispatch({
                    type: "success",
                    message: "successfully taken health potion",
                    title: "congratulation",
                    position: "topR",
                })
            const newHealthPotion=invData.healthPotion-1;
            const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {healthPotion:newHealthPotion });
            console.log(" health potion used successfully");
          } else {
            console.log("No document found for the provided account");
          }

            }
            else if(potionName=="qi Pill"){
                dispatch({
                    type: "success",
                    message: "successfully taken qi Pill",
                    title: "congratulation",
                    position: "topR",
                })
            const newqiPill=invData.qiPill-1;
            const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {qiPill:newqiPill });
            console.log("qi has been enhanced");
          } else {
            console.log("No document found for the provided account");
          }
  
            }
           else if(potionName=="armour potion"){
                dispatch({
                    type: "success",
                    message: "successfully taken  armour potion",
                    title: "congratulation",
                    position: "topR",
                })
            const newarmourPotion=invData.armourEnhancePotion-1;
            const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {armourEnhancePotion:newarmourPotion});
            console.log("armour has been enhanced");
          } else {
            console.log("No document found for the provided account");
          }
  
            }
           else if(potionName=="attack enhance"){
                dispatch({
                    type: "success",
                    message: "successfully taken attack enhance",
                    title: "congratulation",
                    position: "topR",
                })
            const newAttackPotion=invData.attackEnhancePotion-1;
            const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {attackEnhancePotion:newAttackPotion});
            console.log("attack has been enhanced");
          } else {
            console.log("No document found for the provided account");
          }
  
            }
           else if(potionName=="Qi Limit Enhance"){
                dispatch({
                    type: "success",
                    message: "successfully Qi Limit enhanced",
                    title: "congratulation",
                    position: "topR",
                })
            const newQiEnhancePotion=invData.QiLimitEnhancePotion-1;
            const querySnapshot = await getDocs(query(collection(db, "players"), where("account", "==", account)));
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const docRef = doc.ref;
            await updateDoc(docRef, {QiLimitEnhancePotion:newQiEnhancePotion});
            console.log("Qi limit enhanced");
          } else {
            console.log("No document found for the provided account");
          }
  
            }
            else{
                dispatch({
                    type: "error",
                    message: "you got 0 potion buddy",
                    title: "warning",
                    position: "topR",
                })

            }
            
         }

    return (
        <div className="flex flex-col items-center mt-2 bg-purple-900 min-h-screen text-white">
            <div className="max-w-md mb-4">
                {character ? (
                    <Card className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-center text-blue-900">Your Hero</h2>
                        <p><strong>Name:</strong> {character.name}</p>
                        <div className="my-4 flex justify-center">
                            <img src={character.image.toString()} alt="Character Image" className="rounded-md w-72 h-80" />
                        </div>
                        <p><strong>Level:</strong> {character.level.toString()}</p>
                        <p><strong>Max Health:</strong> {character.maxHealth.toString()}</p>
                        <p><strong>Health 💜:</strong> {character.health.toString()}</p>
                        <p><strong>Attack Damage ⚔️:</strong> {character.attackDamage.toString()}</p>
                        <p><strong>Defense 🛡️:</strong> {character.defense.toString()}</p>
                        <p><strong>Max Qi:</strong> {character.maxQi.toString()}</p>
                        <p><strong>Qi:</strong> {character.qi.toString()}</p>
                    </Card>
                ) : (
                    <p>Loading character details...</p>
                )}
            </div>
            <div className="max-w-4xl mb-4">
                {invData ? (
                    <Card className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-center text-blue-900">Your Inventory</h2>
                        <div className='mt-2 text-2xl text-center mb-4'>Available Gold 💰: {invData.goldcoin}</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center m-3">
                                <Image src="/healthPotion.png" height="100" width="100" alt="Health Potion" />
                                <div className="text-green-400 text-lg md:text-2xl">Health Potion: {invData.healthPotion.toString()}</div>
                                <button onClick={() => handleUsePotion("health potion")}className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded">Use</button>
                            </div>
                            <div className="flex flex-col items-center m-3">
                                <Image src="/qiPill.png" height="100" width="100" alt="Qi Pill" />
                                <div className="text-green-400 text-lg md:text-2xl">Qi Pill: {invData.qiPill.toString()}</div>
                                <button onClick={() => handleUsePotion("qi Pill")} className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded">Use</button>
                            </div>
                            <div className="flex flex-col items-center m-3">
                                <Image src="/revive.jpg" height="100" width="100" alt="Armour potion" />
                                <div className="text-green-400 text-lg md:text-2xl">Armour Enhance Potion: {invData.armourEnhancePotion.toString()}</div>
                                <button  onClick={() => handleUsePotion("armour potion")} className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded">Use</button>
                            </div>
                            <div className="flex flex-col items-center m-3">
                                <Image src="/attackEnhancePotion.png" height="100" width="100" alt="Attack Enhance Potion" />
                                <div className="text-green-400 text-lg md:text-2xl">Attack Enhance Potion: {invData.attackEnhancePotion.toString()}</div>
                                <button onClick={() => handleUsePotion("attack enhance")}className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded">Use</button>
                            </div>
                            <div className="flex flex-col items-center m-3">
                                <Image src="/goldDropEnhancePotion.jpg" height="100" width="100" alt="Gold Drop Enhance Potion" />
                                <div className="text-green-400 text-lg md:text-2xl">Qi Limit Enhance Potion: {invData.QiLimitEnhancePotion.toString()}</div>
                                <button onClick={() => handleUsePotion("Qi Limit Enhance")} className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded">Use</button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <p>Loading inventory details...</p>
                )}
            </div>
            <div className="max-w-4xl mb-4">
                {inventory ? (
                    <Card className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-center text-blue-900">Skills</h2>
                        {inventory.skills.map((skill, index) => (
                            <div key={index} className="mb-2 p-2 border-b border-gray-600">
                                <p><strong>Name:</strong> {skill.name}</p>
                                <p><strong>Qi Cost:</strong> {skill.qiCost.toString()}</p>
                            </div>
                        ))}
                    </Card>
                ) : (
                    <p>Loading skills...</p>
                )}
            </div>
            <div className="max-w-4xl mb-4">
                {inventory ? (
                    <Card className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-center text-blue-900">Flames</h2>
                        {inventory.flames.map((flame, index) => (
                            <div key={index} className="mb-2 p-2 border-b border-gray-600">
                                <p><strong>Name:</strong> {flame.name}</p>
                                <p><strong>Color:</strong> {flame.color}</p>
                                <p><strong>Rank:</strong> {flame.rank.toString()}</p>
                            </div>
                        ))}
                    </Card>
                ) : (
                    <p>Loading flames...</p>
                )}
            </div>
        </div>
    );
}
