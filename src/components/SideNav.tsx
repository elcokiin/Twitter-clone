import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

export const SideNav = () => {
    const session = useSession()
    const user = session?.data?.user

    return (
        <nav className="sticky top-0 self-start px-2 py-4">
            <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
                <li>
                    <Link href="/">Home</Link>
                </li>
                {
                    user != null ? (
                        <>
                            <li>
                                <Link href={`/profile/${user.id}`}>Profile</Link>
                            </li>
                            <li>
                                <button onClick={() => void signOut()}>Log Out</button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <button onClick={() => void signIn()}>Log In</button>
                        </li>
                    )
                }
                <li>
                    <Link href="/"></Link>
                </li>
            </ul>
        </nav>
    )
}