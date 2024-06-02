import { gql } from "@apollo/client";

const GET_SKILL_ACQUIRE_ACHIEVEMENTS = gql`
{
  skillAcuireAchievements(orderBy: blockTimestamp){
    id
    player
    name
  }
    }
`
export default GET_SKILL_ACQUIRE_ACHIEVEMENTS;