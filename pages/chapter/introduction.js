import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWeb3Contract } from "react-moralis";
import { useNotification } from 'web3uikit';
import networkMapping from "../../constants/btthAddress.json";
import ContractAbi from "../../constants/btthAbi.json";

export default function Chapter1() {
  const [questNumber, setQuestNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(null);
  const [canProceedToNextQuest, setCanProceedToNextQuest] = useState(false);
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();
  const chainString = "80002"; // Ensure this matches the correct chain ID
  const btthAddress = networkMapping[chainString]?.btthGame[0];

  const handleInputChange = (e) => {
    setQuestNumber(e.target.value);
  };

  const checkQuestCompletion = async () => {
    setLoading(true);
    setIsCompleted(null);
    try {
      const questIndex = parseInt(questNumber);
      if (isNaN(questIndex) || questIndex <= 0) {
        throw new Error("Invalid quest number");
      }

      const questCompletion = await runContractFunction({
        params: {
          abi: ContractAbi,
          contractAddress: btthAddress,
          functionName: "getQuestStatus",
          params: {
            questIndex: questIndex,
          },
        },
      });

      setIsCompleted(questCompletion);
      setCanProceedToNextQuest(questCompletion); // Set canProceedToNextQuest based on the completion status
    } catch (error) {
      console.error(error);
      dispatch({
        type: "error",
        message: error.message,
        title: "Quest Check Failed",
        position: "topR",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-3 bg-pink-900">
      <div className="relative w-full max-w-screen-lg">
        {Array.from({ length: 17 }).map((_, index) => (
          <Image
            key={index}
            src={`/image-${index}.jpg`}
            layout="responsive"
            width={1900}
            height={800}
            objectFit="cover"
            alt={`Chapter 1 Image ${index}`}
            className="rounded-md mb-4"
          />
        ))}
      </div>
      <div className="text-center text-2xl text-white">
        This is an introduction. If you want to read the whole manga you can go to --https://nightcomic.com/manga/battle-through-the-heavens
      </div>
      <div className="w-full flex justify-between mt-4 px-4">
        <Link href="/">
          <button className="m-2 bg-transparent hover:bg-pink-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
            Previous
          </button>
        </Link>
        {canProceedToNextQuest && (
          <Link href={`quest${parseInt(questNumber) + 1}`}>
            <button className="m-2 bg-transparent hover:bg-pink-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              Next Quest
            </button>
          </Link>
        )}
        <Link href="quest1"> {/* Keep the link to the next quest regardless of completion status */}
          <button className="m-2 bg-transparent hover:bg-pink-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
            Next
          </button>
        </Link>
      </div>
      <div className="mt-6 text-center">
        <input
          type="number"
          value={questNumber}
          onChange={handleInputChange}
          placeholder="Enter quest number"
          className="mt-4 p-2 border rounded bg-gray-700 text-white border-gray-500 placeholder-gray-400"
        />
        <button
          onClick={checkQuestCompletion}
          className={`m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${loading ? "cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Quest"}
        </button>
        {isCompleted !== null && (
          <div className={`mt-4 text-2xl ${isCompleted ? "text-green-500" : "text-red-500"}`}>
            {isCompleted ? "Quest Completed! You can proceed." : "Quest Not Completed. Please complete the quest first."}
          </div>
        )}
      </div>
    </div>
  );
}
