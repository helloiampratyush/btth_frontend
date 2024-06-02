import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../../constants/btthAddress.json';
import ContractAbi from '../../constants/btthAbi.json';
import { Card,Select, useNotification } from 'web3uikit';
import levelToValue from "../../constants/lvtoValueatLg.mjs";
import { db } from '../../constants/firebaseConfig';
import { getDocs, query, collection, where, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
export default function quest4(){
    const {chainId,account}=useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : '80002';
    const btthAddress = networkMapping[chainString]?.btthGame[0];

    return(
    <div>

   </div>
    )
}