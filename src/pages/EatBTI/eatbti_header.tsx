import style from './eatbti.module.css';
import { lodingImg } from "../../assets/images";

const  EatBTIHeader = () => {
    return (
        <div className={style.ebti_header}>
            <img
            className={style.ebti_logo}
            src={lodingImg.EatBtiLogo}
            alt="EBTI Logo"
            />
        </div>
    )
}
export default EatBTIHeader;