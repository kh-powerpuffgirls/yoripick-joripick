import style from './imageModal.module.css';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal = ({ imageUrl, onClose }: ImageModalProps) => {
  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal}>
        <img src={imageUrl} alt="Challenge Detail" className={style.image} />
      </div>
    </div>
  );
};