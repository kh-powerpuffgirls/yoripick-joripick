import type { Dispatch, SetStateAction } from "react";

interface NewChallengeProps {
  setOpenNewCh: Dispatch<SetStateAction<boolean>>;
}

export const NewChallenge = ({setOpenNewCh} : NewChallengeProps) => {
    const closeBtn = () => {
        setOpenNewCh(false);
    }
    return (
        <></>
    )
}