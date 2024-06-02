import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../constants/loginAddress.json';
import ContractAbi from '../constants/loginAbi.json';
import btthAbi from '../constants/btthAbi.json';
import btthMapping from '../constants/btthAddress.json';
import { Card, useNotification } from 'web3uikit';
import { db } from '../constants/firebaseConfig'; // Adjust this path as needed
import { getDocs, query, collection, where, updateDoc, doc } from 'firebase/firestore';

export default function Login() {
  const { chainId, isWeb3Enabled, account } = useMoralis();
  const [number, setNumber] = useState(0);
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();
  const chainString = chainId ? parseInt(chainId).toString() : "80002";
  const loginAddress = networkMapping[chainString]?.logIn[0];
  const btthAddress=btthMapping[chainString]?.btthGame[0];
  const [checkQuest2,setCheckQuest2]=useState(null);
  useEffect(() => {
    console.log("Chain ID:", chainId);
    console.log("Login Address:", loginAddress);
  }, [chainId, loginAddress]);

  const loginHere = {
    abi: ContractAbi,
    contractAddress: loginAddress,
    functionName: "startLogin"
  };

  const updateHere = {
    abi: ContractAbi,
    contractAddress: loginAddress,
    functionName: "updateStatus"
  };

  const handleUpdateFunction = async () => {
    console.log("Updating status with:", updateHere);
    await runContractFunction({
      params: updateHere,
      onSuccess: handleUpdateSuccess,
      onError: (error) => console.log("Update Error:", error)
    });
  };

  const handleUpdateSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Successfully updated",
      position: "topR"
    });
    await updateGoldCoinAmount();
  };

  const handleLoginFunction = async () => {
    console.log("Logging in with:", loginHere);
    await runContractFunction({
      params: loginHere,
      onSuccess: handleLoginSuccess,
      onError: (error) => console.log("Login Error:", error)
    });
  };

  const handleLoginSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Successfully applied",
      position: "topR"
    });
  };

  useEffect(() => {
    setUpUi();
    setUpUi1();
  }, [isWeb3Enabled,account]);

  const setUpUi = async () => {
    await runContractFunction({
      params: {
        abi: ContractAbi,
        contractAddress: loginAddress,
        functionName: "returnNumber"
      },
      onSuccess: (result) => {
        console.log("Returned number:", result);
        setNumber(result.toString());
      },
      onError: (error) => console.log("Setup UI Error:", error)
    });
  };
  const setUpUi1=async()=>{
 const setme=await runContractFunction({
    params:{
      abi:btthAbi,
      contractAddress:btthAddress,
      functionName:"getQuestStatus",

      params:{
        questIndex:2
      }
    }
 })
   if(setme){
    setCheckQuest2(setme);
   }
  }
  const fetchGoldCoinAmount = async () => {
    const q = query(collection(db, 'players'), where('account', '==', account));
    const querySnapshot = await getDocs(q);
    let goldCoinAmount = 0;
    querySnapshot.forEach((doc) => {
      goldCoinAmount = doc.data().goldcoin;
    });
    return goldCoinAmount;
  };

  const updateGoldCoinAmount = async () => {
    const goldCoinAmount = await fetchGoldCoinAmount();
    const newGoldCoinAmount = goldCoinAmount + number * 100;

    const q = query(collection(db, 'players'), where('account', '==', account));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      const userDoc = doc(db, 'players', document.id);
      await updateDoc(userDoc, { goldcoin: newGoldCoinAmount });
    });

    dispatch({
      type: "success",
      message: `Gold coin amount updated to ${newGoldCoinAmount}`,
      position: "topR"
    });
  };
     
  return (
    <div className='bg-violet-950 min-h-screen flex flex-col items-center py-10'>
      {checkQuest2?
      <div className='flex flex-col items-center'>
      <div className='flex flex-col items-center'>
        <div className='mt-4'>
          <Card className='p-6'>
            <p className='text-2xl text-stone-800 mb-3'>Hello! Here you will get a reward</p>
            <p className='text-2xl text-red-900 mb-3'>please complete quest 2 to accept reward</p>
            <p className='text-xl mb-2'>1️⃣ This system is totally based upon Chainlink VRFs so first you have to get a random number then you have to use it to get a gold coin award.</p>
            <p className='text-xl mb-2'>2️⃣ First you will click on the "Get Number" button, then after 1 minute, a number will appear on your screen.</p>
            <p className='text-xl mb-2'>3️⃣ After the number appears, you will click on the "Claim Reward" button.</p>
            <p className='text-xl mb-2'>4️⃣ You will get a reward of number * 100 gold.</p>
            <p className='text-xl mb-2'>5️⃣ you will only get reward and can apply number in regular 24 hours </p>
          </Card>
        </div>
      </div>
      <div className='mt-8'>
        <Card className='p-6'>
          <div className='text-center mb-4'>
            <p className='text-xl'>Your Number: {number}</p>
          </div>
          <div className='flex flex-row justify-center space-x-4'>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              onClick={handleLoginFunction}
            >
              Get Number
            </button>
            <button
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
              onClick={handleUpdateFunction}
            >
              Claim Reward
            </button>
          </div>
        </Card>
      </div>
      </div>
      :(<div className=' text-center text-3xl text-red-900 mt-5'>
          locked 🔒 complete quest2

      </div>)
}
    </div>
  );
}
