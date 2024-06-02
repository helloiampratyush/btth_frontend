import { gql } from "@apollo/client";

const GET_QUEST_ACHIEVEMENTS = gql`
{

  questCompletionAchievememts(orderBy: blockTimestamp, where: { questIndex_not: 0 }) {
        id
        player
        questIndex
      }
    }
`
export default GET_QUEST_ACHIEVEMENTS;