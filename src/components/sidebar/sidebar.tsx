"use client";

import { SideBarItems, UserRole } from "@/src/config/sidebar/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "../LogoutButton";

type sidebarProps= {
  role: UserRole;
  imageUrl: string | null;
  firstName: string;
}

export default function SideBar({ 
  role,
  imageUrl,
  firstName,
}: sidebarProps) {
  const pathName = usePathname();
  const items = SideBarItems[role];

  const [isCollapse, setIsCollapse] = useState(false);

  // SETTING ACTIVATED
  const isSettingActive = pathName === `/${role}/settings`

  return (
    <aside
    className={` bg-white min-h-screen rounded-lg transition-all duration-300 flex flex-col gap-y-5 text-color-8
      ${isCollapse
        ? "w-20 px-2 py-6"
        : "w-60 p-6"
      }
    `}
    >
      <div className={`flex gap-4
        ${isCollapse
          ? "flex-col justify-normal"
          : "flex-col md:flex-row justify-between md:gap-y-0"
        }
      `}>
        <div className="flex gap-x-2  justify-center">
          <img
          src="/wesup-logo.svg"
          alt="logo"
          className="w-7"
          />
          <img 
          src="/wesup-wordmark.svg" 
          alt="wordmark" 
          className={`w-20 mt-1
            ${isCollapse
              ? "hidden"
              : "hidden md:block"
            }
          `}
          />
        </div>
        <button 
        onClick={() => setIsCollapse(!isCollapse)}
        className="flex justify-center items-center"
        >
          <img
          src="/sidebar-button.svg"
          alt=""
          className="w-5 h-5"
          />
        </button>
      </div>
      
      <nav>
        <nav className="flex flex-col gap-y-1">
          {items.map((item) => {
            const isActive = pathName === item.href;
            return(
              <Link
              key={item.href}
              href={item.href}
              className={`flex p-2 items-center gap-4 rounded-lg
                ${isActive
                  ? "bg-color-5 hover:bg-none"
                  : "bg-white hover:bg-color-5"
                }
                ${isCollapse
                  ? "justify-center h-12"
                  : "flex-row"
                }
              `}
              >
                <div className="w-6 flex justify-center ">
                  <img
                  src={item.icon}
                  alt=""
                  className={item.iconClassName}
                  />
                </div>
                <span className={` text-left text-sm md:text-center
                  ${isCollapse
                  ? "hidden"
                  : "block"
                }
                `}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <nav className="flex flex-col gap-y-1">
          <Link
          href={`/${role}/settings`}
          className={`flex p-2 items-center gap-4 rounded-lg
            ${isSettingActive
              ? "bg-color-5 hover:bg-none"
              : "bg-white hover:bg-color-5"
            }
            ${isCollapse
              ? "justify-center h-12"
              : "flex-row"
            }
          `}
          >
            <div className="flex justify-center w-6">
              <img
              src="/settings.svg"
              alt=""
              className="w-5 h-5"
              />
            </div>
            <span className={` text-left text-sm md:text-center
              ${isCollapse
              ? "hidden"
              : "block"
            }
            `}>
              Settings
            </span>
          </Link>
        
          <LogoutButton
          collapsed={isCollapse}
          />
        </nav>
      </nav>
      
      <div className={`flex flex-row items-center gap-2 mt-auto
        ${isCollapse
          ? "justify-center"
          : "justify-normal"
        }
      `}
      >
        <img
        src={imageUrl || "/user-blank.svg"}
        alt="img"
        className="w-10 h-10 object-cover rounded-full"
        />
        <div className={`
          ${isCollapse
            ? "hidden"
            : "block"
          }
        `}
        >
          <p>{firstName}</p>
          <p className="text-sm text-color-6 capitalize">{role}</p>
        </div>
      </div>

    </aside>
  )
}