import React, { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from 'web3uikit';
import networkMapping from "../../constants/btthAddress.json";
import ContractAbi from "../../constants/btthAbi.json";
import { useRouter } from 'next/router';

export default function Quest1() {
  const { chainId,account, isWeb3Enabled } = useMoralis();
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();
  const router = useRouter();
  const chainString = chainId ? parseInt(chainId).toString() : "80002";
  const btthAddress = networkMapping[chainString]?.btthGame[0];

  const [questCompleted1, setQuestCompleted1] = useState(false);
  const [questCompleted2, setQuestCompleted2] = useState(false);
  const [questCompleted3, setQuestCompleted3] = useState(false);
  const [puzzle1Answer, setPuzzle1Answer] = useState('');
  const [puzzle2Answer, setPuzzle2Answer] = useState('');
  const [puzzle3Answer, setPuzzle3Answer] = useState('');
  const [checkThings, setCheck] = useState(false);

  const handleQuestSubmission = () => {
    router.push('quest2');
  };

  const updation1 = {
    abi: ContractAbi,
    contractAddress: btthAddress,
    functionName: "characterUpdate",
    params: {
      questIndex: 1,
      level: "eight star dou zhi qi",
      Index: 0,
      Maxhealth: 300,
      health: 300,
      attackDamage: 30,
      defense: 10,
      weapon: "none",
      qi: 40,
      maxQi: 40
    }
  };

  const updation2 = {
    abi: ContractAbi,
    contractAddress: btthAddress,
    functionName: "inventorySkillUpdate",
    params: {
      name: "vaccum palm",
      qiCost: 10
    }
  };

  const updation3 = {
    abi: ContractAbi,
    contractAddress: btthAddress,
    functionName: "inventorySkillUpdate",
    params: {
      name: "octane blast",
      qiCost: 20
    }
  };

  const setUpUi = async () => {
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
        setCheck(nextui);
      }
    } catch (error) {
      console.error("Error fetching quest status:", error);
    }
  };

  const handleUpdate1 = async () => {
    if (puzzle3Answer === '5'&&checkThings!=true&&questCompleted1&&questCompleted2) {
      try {
        await runContractFunction({
          params: updation1,
          onSuccess: handleUpdate3Success,
          onError: (error) => {
            console.error("Error executing update 3:", error);
            dispatch({
              type: "error",
              message: "Error executing update 3",
              position: "topR"
            });
          }
        });
      } catch (error) {
        console.error("Error executing update 3:", error);
      }
    } else {
      dispatch({
        type: "error",
        message: "Puzzle 3 answer is incorrect or uncompleted.",
        position: "topR"
      });
    }
  };
  const handleUpdate1Success=async(tx)=>{
    await tx.wait(1);
    dispatch({
      position:"topR",
      type:"success",
      title:"congratulation",
      message:"done",

     })
     setQuestCompleted1(true);
  }
  const handleUpdate2 = async () => {
    if (puzzle1Answer === '21'&&checkThings!=true) {
      try {
        await runContractFunction({
          params: updation2,
          onSuccess: handleUpdate1Success,
          onError: (error) => {
            console.error("Error executing update 1:", error);
            dispatch({
              type: "error",
              message: "Error executing update 1",
              position: "topR"
            });
          }
        });
      } catch (error) {
        console.error("Error executing update 1:", error);
      }
    } else {
      dispatch({
        type: "error",
        message: "Puzzle 1 answer is incorrect.",
        position: "topR"
      });
    }
  };
  const handleUpdate2Success=async(tx)=>{
    await tx.wait(1);
    dispatch({
      position:"topR",
      type:"success",
      title:"congratulation",
      message:"done",

     })
     setQuestCompleted2(true);
  }
  const handleUpdate3 = async () => {
    if (puzzle2Answer === '13'&&checkThings!=true) {
      try {
        await runContractFunction({
          params: updation3,
          onSuccess: handleUpdate2Success,
          onError: (error) => {
            console.error("Error executing update 2:", error);
            dispatch({
              type: "error",
              message: "Error executing update 2",
              position: "topR"
            });
          }
        });
      } catch (error) {
        console.error("Error executing update 2:", error);
      }
    } else {
      dispatch({
        type: "error",
        message: "Puzzle 2 answer is incorrect.",
        position: "topR"
      });
    }
  };
  const handleUpdate3Success=async(tx)=>{
    await tx.wait(1);
    dispatch({
      position:"topR",
      type:"success",
      title:"congratulation",
      message:"done",

     })
     setQuestCompleted3(true);
  }
  useEffect(() => {
    setUpUi();
    const intervalId = setInterval(() => {
      setUpUi();
      questCompleted1
      questCompleted2
      questCompleted3
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [account]);
  return (
    <div className="bg-slate-700 min-h-screen py-8">
      {!checkThings&&(
      <div className="max-w-md mx-auto bg-zinc-800 p-6 rounded-lg shadow-md">
        <div className="mb-8">
        <div className='  text-slate-50 font-medium'> xiao yan mysterically lost his all power and get proposal of challenge by nalan yaran after three years to get divorce and xiao find yao lao spirit behind his losing of power yao lao agrees to teach xiao yan</div>
          <p>What number comes next in the sequence? 1, 1, 2, 3, 5, 8, 13, ...</p>
          <input
            type="text"
            value={puzzle1Answer}
            onChange={(e) => setPuzzle1Answer(e.target.value)}
            className="mt-2 p-2 border bg-slate-700 rounded-md w-full"
          />
          <button onClick={handleUpdate2} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">accept skill</button>
        </div>

        <div className="mb-8">
        <div className='  text-slate-50 font-medium'>yao lao taught xiao yan first skill vaccum palm</div>
          <p>What is the missing number in the sequence? 2, 3, 5, 7, 11, ?, 17</p>
          <input
            type="text"
            value={puzzle2Answer}
            onChange={(e) => setPuzzle2Answer(e.target.value)}
            className="mt-2 p-2 border bg-slate-800 rounded-md w-full"
          />
          <button onClick={handleUpdate3} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">accept octane</button>
        </div>

        <div className="mb-8">

          <div className='  text-slate-50 font-medium'> By seeing upcoming age ceromany yao lao finally gave octane blast to xiao yan!</div>
          <p>What is the value of X in the equation? 3X + 5 = 20</p>
          <input
            type="text"
            value={puzzle3Answer}
            onChange={(e) => setPuzzle3Answer(e.target.value)}
            className="mt-2 p-2 border bg-slate-800 rounded-md w-full"
          />
          <button onClick={handleUpdate1} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">practice</button>
        </div>
        </div>
           )}
        {(checkThings) ||( questCompleted1 && questCompleted2 && questCompleted3)?(
          <div className=' flex flex-col items-center'>
            <div> you have completed now move on
              </div>
          <button onClick={handleQuestSubmission} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">Quest Submission</button>
          </div>
        )
      :(<div></div>)}
      
    </div>
  );
}
