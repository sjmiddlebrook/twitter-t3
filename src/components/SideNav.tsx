import { Home, LogIn, LogOut, UserCircle } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function SideNav() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <nav className="sticky top-0 flex flex-col items-center px-4 md:items-start md:pr-6">
      <Link className="pb-2 pt-4" href="/">
        <div className="flex h-10 w-10 rounded-md bg-orange-200 " />
      </Link>
      <ul className="flex flex-col space-y-6 pt-4">
        <li>
          <Link className="flex items-center space-x-2" href="/">
            <Home size={24} />
            <span className="hidden md:inline">Home</span>
          </Link>
        </li>
        {user && (
          <li>
            <Link
              className="flex items-center space-x-2"
              href={`/profiles/${user.id}`}
            >
              <UserCircle size={24} />
              <span className="hidden md:inline">Profile</span>
            </Link>
          </li>
        )}
        {user ? (
          <li>
            <button
              className="flex items-center space-x-2"
              onClick={() => void signOut()}
            >
              <LogOut size={24} />
              <span className="hidden md:inline whitespace-nowrap">Sign out</span>
            </button>
          </li>
        ) : (
          <li>
            <button
              className="flex items-center space-x-2"
              onClick={() => void signIn()}
            >
              <LogIn size={24} />
              <span className="hidden md:inline whitespace-nowrap">Sign In</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
