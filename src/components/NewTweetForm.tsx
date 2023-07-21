import { ProfileImage } from "./ProfileImage"
import { Button } from "./Button"
import { useSession } from "next-auth/react"
import { useState, useLayoutEffect, useRef, useCallback } from "react"
import { api } from "~/utils/api"

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return
    textArea.style.height = "0px"
    textArea.style.height = `${textArea.scrollHeight}px`
}

export const NewTweetForm = () => {
    const session = useSession()
    if (session.status !== "authenticated") return null
    
    return <Form />
}

function Form() {
    const session = useSession()
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>()
    const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
        updateTextAreaSize(textArea)
        textAreaRef.current = textArea
    }, [])

    useLayoutEffect(() => {
        updateTextAreaSize(textAreaRef.current)
    }, [inputValue])

    const createTweet = api.tweet.create.useMutation({ onSuccess: 
        newTweet => {
            console.log(newTweet)
            setInputValue("")
        }
    })

    if (session.status !== "authenticated") return null

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (inputValue.trim() === "") return
        createTweet.mutate({ content: inputValue })
        setInputValue("")
    }

    return (
        <form
            onSubmit={handleSubmit} 
            className="flex flex-col gap-2 border-b px-4 py-2">
            <div className="flex gap-4">
                <ProfileImage src={session.data.user.image}/>
                <textarea 
                    ref={inputRef}
                    className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none place"
                    placeholder="What's happening"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    style={{ height: 0 }}
                />
            </div>
            <Button className="self-end">Tweet</Button>
        </form>
    )
}
