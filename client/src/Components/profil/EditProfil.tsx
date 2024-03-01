import React, { useRef, useState } from 'react';
import '../../style/EditProfil.css';
import { on } from 'events';


interface EditProfilProps {
  title: string;
  username: string;
  profilPicture: string;
  twofactor: boolean;
  onClose: () => void;
  onUpdateUsername: (newUsername: string) => void;
  onUploadProfilePicture: (file: File) => void;
  onToggle2FA: () => void;
  onSubmit: () => void;
}

const EditProfil: React.FC<EditProfilProps> = ({
  title,
  username,
  profilPicture,
  twofactor,
  onClose,
  onUpdateUsername,
  onUploadProfilePicture,
  onToggle2FA,
  onSubmit,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value;
      onUpdateUsername(username);
  };

  const fileInput = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };
  

  const handleFileChange = (event: any) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedImage(file);
    }
  };
  
  const handleSave = async () => {
    if (selectedImage) {
      await onUploadProfilePicture(selectedImage);
    }
    onSubmit();
  };


  const handleToggle2FA = () => {
    onToggle2FA();
  };

  return (
    <div className="edit-profil">
      <button className="ProfileButton" onClick={onClose}>X</button>
        <h2 className="title">{title}</h2>  
      <div className="Profile-picture">
        <img src={selectedImage ? URL.createObjectURL(selectedImage) : profilPicture} alt="img" className="editImage" onClick={handleImageClick}/>
        <input type="file" ref={fileInput} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
      </div>
      <div className="input-group">
        <input required type="text" name="text" autoComplete="off" className="inputProfil" value={username} onChange={handleUsernameChange}/>
        <label className="user-label">Username</label>
      </div>

      <div className="twofactor-container">
        <label>2FA-Auth:</label>
        <div className="twofactor-checkbox">
          <input type="checkbox" checked={twofactor} onChange={handleToggle2FA} />
          <span>{twofactor ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="save-close-buttons">
        <button className="select" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default EditProfil;