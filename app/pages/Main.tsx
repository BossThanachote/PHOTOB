'use client'
import { motion,AnimatePresence } from "framer-motion";
import { BiSolidLeftArrow } from "react-icons/bi";
import { BiSolidRightArrow } from "react-icons/bi";
import state from "../store";
import { useSnapshot } from "valtio";
import { useState } from "react";

export default function Main() {
  const snap = useSnapshot(state);
  const [isExiting, setIsExiting] = useState(false); 

  const handleClick_snap2 = () => {
    setIsExiting(true); 
    setTimeout(() => {
      state.intro = 2; 
      setIsExiting(false); 
    }, 1600);
  };

  const bounceRight = {
    hidden: { x: 10 },
    visible: {
      x: [0, 10, 0],
      transition: {
        x: {
          duration: 0.8,
          ease: [0.5, 0.05, -0.01, 0.9],
          repeat: Infinity,
        },
      },
    },
  };

  const bounceLeft = {
    hidden: { x: -10 },
    visible: {
      x: [0, -10, 0],
      transition: {
        x: {
          duration: 0.8,
          ease: [0.5, 0.05, -0.01, 0.9],
          repeat: Infinity,
        },
      },
    },
  };

  
  return (
    <>
    <AnimatePresence>
      {snap.intro == 1 && !isExiting &&  (
        <div 
          className="w-screen h-screen border-transparent border-2 flex justify-center items-center cursor-pointer relative"
          onClick={handleClick_snap2}
          >
        <div className="w-[50rem] h-full border-transparent border-2 flex flex-col relative">
        <motion.div
          className="w-full h-[20rem] flex justify-center items-center border-transparent border-2 mt-[8rem] md:mt-[15rem] relative"
          initial={{ y: -1000, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{
            type: "spring",
            damping: 5,
            stiffness: 30,
            duration: 0.1,
            ease: "easeInOut",
          }}
          exit={{
            y: -1000, 
            opacity: 0, 
            transition: {
              opacity: { duration: 1.5, ease: "easeOut" },
              duration: 1,
              ease: "backIn", 
            },
          }}
        >
              <motion.p
                className="font-dream-sparks-400 md:text-[13.8rem] sm:text-[10rem] text-[8rem] absolute z-0 select-none" 
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                >
                LOGO
              </motion.p>

              <motion.p
                className="font-dream-sparks-400 md:text-[13.8rem] sm:text-[10rem] text-[8rem] absolute z-10 text-white text-shadow-black ml-3 mt-1 select-none" 
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                >
                LOGO
              </motion.p>

            
            <motion.p
              className="md:text-2xl sm:text-xl text-black mt-[15rem] md:ml-0 sm:ml-7 relative z-20 select-none" 
              style={{ letterSpacing: '22px' }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              >
              photo booth
            </motion.p>
          </motion.div>

          
          <motion.div 
            className="w-full h-full border-transparent border-2 mt-[10rem] flex justify-center items-center mb-[20rem] lg:mb-[10rem]"
            initial={{y:100 , opacity :0}}
            animate={{y:0, opacity:1 }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 30,
              duration: 2,
              delay: 1,
              ease: "easeInOut",
            }}
            >
            <motion.span 
              variants={bounceRight} 
              initial="hidden" 
              animate="visible" 
              exit={{
                x: -300, 
                opacity: 0, 
                transition: {
                  x: { duration: 1, ease: "easeInOut" }, 
                  opacity: { duration: 0.5, ease: "easeOut" }, 
                },
              }}
            >
              <BiSolidRightArrow className="text-[2rem] select-none" />
            </motion.span>
            <motion.p className="font-dream-sparks-400 text-[2rem] mx-[2rem] select-none"
              exit={{
                scale:2,
                opacity:0,
                transition:{
                  duration:1,
                  scale:{ duration:1, ease: "easeInOut"},
                  opacity:{duration: 0.5, ease: "easeOut"},
                }
              }}  
            >
              TOUCH SCREEN
            </motion.p> 
            <motion.span 
              variants={bounceLeft} 
              initial="hidden" 
              animate="visible" 
              exit={{
                x: 300, 
                opacity: 0, 
                transition: {
                  x: { duration: 1, ease: "easeInOut" }, 
                  opacity: { duration: 0.5, ease: "easeOut" }, 
                },
              }}
            >
              <BiSolidLeftArrow className="text-[2rem] select-none" /> 
            </motion.span>
          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
    </>
  );
}
