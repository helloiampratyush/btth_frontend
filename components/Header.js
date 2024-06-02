import { ConnectButton } from "web3uikit";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            setVisible(
                (prevScrollPos > currentScrollPos && prevScrollPos - currentScrollPos > 70) || currentScrollPos < 10
            );
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [prevScrollPos, visible]);

    return (
        <>
            <nav
                className={`p-2 bg-green-500 border-b-2 flex fixed top-0 w-full z-10 transition-all ${
                    visible ? "" : "-translate-y-full"
                }`}
            >
                <h1 className="py-4 px-4 font-bold text-3xl">Battle Through Heavens Game</h1>
                <div className="flex flex-grow mr-4 justify-end items-center space-x-4">
                    <Link href="/">
                        <button className="p-6 mx-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring focus:ring-blue-300 transition duration-300">HOME</button>
                    </Link>
                    <Link href="/live-chat">
                        <button className="p-6 mx-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring focus:ring-blue-300 transition duration-300">Live Chat</button>
                    </Link>
                    
                    <Link href="/achievements">
                        <button className="p-6 mx-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring focus:ring-blue-300 transition duration-300">Achievements</button>
                    </Link>
                    <Link href="/login">
                        <button className="p-6 mx-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring focus:ring-blue-300 transition duration-300">Login</button>
                    </Link>
                    <Link href="/pvp">
                        <button className="p-6 mx-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring focus:ring-blue-300 transition duration-300">PvP</button>
                    </Link>
                    <Link href="/character-details">
                        <button className="p-6 mx-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring focus:ring-blue-300 transition duration-300">Character Details</button>
                    </Link>
                    <ConnectButton moralisAuth={false} className="mx-2" />
                </div>
            </nav>
            <div className="h-20"></div> {/* Placeholder to prevent content from being obscured by fixed navbar */}
        </>
    );
}


