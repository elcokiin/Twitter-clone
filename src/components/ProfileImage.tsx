import Image from "next/image"

type ProfileImagesProps = {
    src?: string | null,
    className?: string
}

export const ProfileImage = ({ src, className=""}: ProfileImagesProps) => {
    return (
        <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
            {
                src != null && (
                    <Image src={src} alt="Profile Image" quality={100} fill/>
                ) 
            }
        </div>
    )
}