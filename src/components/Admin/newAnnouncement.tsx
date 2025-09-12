import type { Dispatch, SetStateAction } from "react";

interface NewAnnouncementProps {
  setOpenNewAnn: Dispatch<SetStateAction<boolean>>;
}

export const NewAnnouncement = ({setOpenNewAnn} : NewAnnouncementProps) => {
    const closeBtn = () => {
        setOpenNewAnn(false);
    }
    return (
        <></>
    )
}