import axios from "axios";
import {FC, useState} from "react";
import './adminPanel.css'


interface AdminPanelProps {
    chatName: string | null;
}

const AdminPanel: FC<AdminPanelProps> = ({chatName}) => {
    const [passInput, setPassInput] = useState('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState('');

    const handleChangePass = (event: any) => {
        setPassInput(event.target.value);
        setError('');
        setSuccess('');
    }

    const setPassword = async () => {
        setError('');
        setError('');
        try {
            var response = await axios.patch(`api/chat/${chatName}/password`, {
                password: passInput
            });
            setSuccess(response.data);
        } catch (error) {
            console.log(error);
        }
        setPassInput('');
    };

    const setNewPassword = async () => {
        if (passInput.length < 3) {
            setSuccess('');
            setError('Password is too short!');
        } else {
            await setPassword();
        }
    }

    const deletePassword = async () => {
        setPassInput('');
        await setPassword();
    };

    return (
        <div className='admin-panel'>
            <div className="search-panel">
                <input type="password" value={passInput} placeholder="Add/change password" style={{width: "auto"}}
                       onChange={handleChangePass}/>
                <button style={{width: "auto"}} onClick={setNewPassword}>Set password</button>
            </div>

            <button onClick={deletePassword}>Delete password</button>
            <span className='invalid-feedback'>{error}</span>
            <span className='success-feedback'>{success}</span>
        </div>
    );
}

export default AdminPanel