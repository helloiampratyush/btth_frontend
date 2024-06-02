import { useMoralis } from "react-moralis";
import { useQuery } from "@apollo/client";
import GET_QUEST_ACHIEVEMENTS from "../constants/QuestAchievements";
import GET_SKILL_ACQUIRE_ACHIEVEMENTS from "../constants/skillAchievements";

export default function Achievements() {
    const { chainId, isWeb3Enabled, account } = useMoralis();
    const { loading: loading1, error: error1, data: data1 } = useQuery(GET_QUEST_ACHIEVEMENTS);
    const { loading: loading2, error: error2, data: data2 } = useQuery(GET_SKILL_ACQUIRE_ACHIEVEMENTS);

    // Function to format the player's account
    const formatAccount = (account) => {
        return `${account.slice(0, 4)}****${account.slice(-4)}`;
    };

    return (
        <div className="min-h-screen bg-green-800 p-6">
            <div className="mb-6">
                {!loading1 && data1 ? (
                    data1.questCompletionAchievememts.map((announcing) => {
                        const { player, questIndex } = announcing;

                        return (
                            <div key={player} className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-center my-3 p-4 rounded shadow-lg">
                                <p className="text-xl font-semibold">🎉 Congratulations Player <span className="relative group">
                                    <span>{formatAccount(player)}</span>
                                    <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-700 text-white text-sm p-2 rounded shadow-lg">{player}</span>
                                </span>!</p>
                                <p className="mt-2">You have successfully completed quest {questIndex}.</p>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500">Nothing to show</div>
                )}
            </div>

            <div>
                {!loading2 && data2 ? (
                    data2.skillAcuireAchievements.map((announcing) => {
                        const { player, name } = announcing;

                        return (
                            <div key={player} className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-center my-3 p-4 rounded shadow-lg">
                                <p className="text-xl font-semibold">🎉 Congratulations Player <span className="relative group">
                                    <span>{formatAccount(player)}</span>
                                    <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-700 text-white text-sm p-2 rounded shadow-lg">{player}</span>
                                </span>!</p>
                                <p className="mt-2">You have successfully acquired the skill {name}.</p>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500">Nothing to show</div>
                )}
            </div>
        </div>
    );
}
