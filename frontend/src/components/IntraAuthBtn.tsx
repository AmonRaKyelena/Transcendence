import { FC } from "react"
import Image from "next/image";
import '../styles/intraAuthBtn.css'

const IntraAuthBtn: FC = () => {

	return (
		<div className="intra_btn">
			<a href='/api/auth/loginIntraCode' className='login'>
				<span>LOGIN WITH</span>
				<Image 
					src="/intra_logo.svg"
					width={40}
					height={40}
					alt="Intra logo" />
			</a>
		</div>
	);
}

export default IntraAuthBtn