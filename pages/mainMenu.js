import Image from "next/image";
import { Card, Form, Button, Input, Select } from "web3uikit";
import Link from "next/link";
import pvpmap from "../constants/pvpAddress.json";
import pvpAbi from "../constants/pvpAbi.json";
import btthmap from "../constants/btthAddress.json";
import btthAbi from "../constants/btthAbi.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from 'web3uikit';
import { useEffect, useState } from "react"; 
import { useRouter } from "next/router";
import { db } from './firebaseConfig'; // Adjust this path as needed
import { getDocs, addDoc,query, collection, where, updateDoc, doc } from 'firebase/firestore';
async function saveToFireStore(account,maxHp,hp,level,attackDamage,defence,qi,maxQi,weapon,isYourChance,opponenet){
    try{
      const docRef=await addDoc(collection(db,"pvp"),{
        account:account,
        maxHp:maxHp,
        hp:hp,
        level:level,
        attackDamage:attackDamage,
        defence:defence,
        qi:qi,
        maxQi:maxQi,
        weapon:weapon,
        isYourChance:isYourChance,
        opponenet:opponenet
      });
      console.log("added successfully");
    }catch(error){
      console.log(error);
      console.log("false");
    }
  }
export default function MainMenu() {
    const { chainId, account } = useMoralis();
    const dispatch=useNotification();
    const { runContractFunction } = useWeb3Contract();
    const chainString = chainId ? parseInt(chainId).toString() : "80002";
    const pvpAddress = pvpmap[chainString]?.pvpBattle[0];
    const btthAddress = btthmap[chainString]?.btthGame[0];
    const [checkPvP, setCheckPvP] = useState(null);
    const [checkQuest,setCheckQuest]=useState(null);
    const router = useRouter();

    useEffect(() => {
            setUpUi1();
            setUpUi2();
    }, [account]);

    const setUpUi1 = async () => {
        try {
            const setMe = await runContractFunction({
                params: {
                    abi: pvpAbi,
                    contractAddress: pvpAddress,
                    functionName: "retrieveIsStarted"
                }
            });
            if (setMe !== undefined) {
                setCheckPvP(setMe);
            }
        } catch (error) {
            console.error("Error in setUpUi1:", error);
        }
    };
    const setUpUi2=async()=>{
        const setMe=await runContractFunction({
           params:{
          abi:btthAbi,
          contractAddress:btthAddress,
          functionName:"getQuestStatus",

            params:{
             questIndex:2
            }
           } 
        })
        if(setMe){
            setCheckQuest(setMe);
        }
    }
    const handleMainStory = () => {
        router.push('/chapter/introduction');
    };
    const handleActivatePvP=async()=>{
        setUpUi1();
        setUpUi2();
          if(checkPvP.isPvPactive==false&&checkQuest==true){
            await runContractFunction({
                params:{
                  abi:pvpAbi,
                  contractAddress:pvpAddress,
                  functionName:'startPvP'
                
                },
                onSuccess:handlePvPActiveSuccess,
                onError:(error)=>{
                    console.log(error);
                }
            })
            
          }
          else{
            dispatch({
              position:"topR",
              type:"warninig",
              title:"hello",
              message:"already activated or uncomplete quest"
            })
          }

    }
 const handlePvPActiveSuccess=async(tx)=>{
    await tx.wait(1);
      saveToFireStore(account,0,0,"one star dou zhi qi",0,0,0,0,"none",false,"no one");
      dispatch({
        position:"topR",
        type:"success",
        title:"congratulation",
        message:"successFully done"
      })
 }
 const handlePvPgo=()=>{
    router.push('pvp');
 }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Main Menu</h1>
                <div className="flex flex-col items-center space-y-6">
                    <div className="flex flex-row items-center justify-between w-full bg-blue-50 p-4 rounded-lg shadow-sm">
                        <p className="text-lg font-semibold text-gray-800">Play Main Story</p>
                        <button 
                            onClick={handleMainStory} 
                            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            Go
                        </button>
                    </div>
                    <div className="flex flex-col items-center w-full bg-red-50 p-4 rounded-lg shadow-sm">
                        <p className="text-lg font-semibold text-gray-800 mb-4">Player vs Player</p>
                        <div className="flex space-x-4">
                            <button onClick={handleActivatePvP}className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200">
                                Activate
                            </button>
                            <button onClick={handlePvPgo}className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200">
                                Go
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
