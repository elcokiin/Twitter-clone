import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { ProfileImage } from "./ProfileImage"
import { useSession } from "next-auth/react"
import { VscHeartFilled, VscHeart } from "react-icons/vsc"

import { IconHoverEffect } from "./IconHoverEffect"
import { api } from "~/utils/api"

type Tweet = {
    id: string;
    content: string;
    createdAt: Date;
    likeCount: number;
    likedByMe: boolean;
    user: { id: string, name: string | null, image: string | null};
}

type InfiniteTweetsProps = {
    isLoading: boolean
    isError: boolean
    hasMore: boolean
    fetchNewTweets: () => Promise<unknown>
    tweets?: Tweet[]
}

export const InfiniteTweets = ({ isLoading, isError, hasMore, fetchNewTweets, tweets }: InfiniteTweetsProps) => {
    if(isLoading) return <h1>Loading...</h1>
    if(isError) return <h1>Error</h1>

    if(tweets == null || tweets.length === 0) {
        return <h1 className="my-4 text-center text-2x1 text-gray-500">No tweets yet</h1>
    }

    return (
        <ul>
            <InfiniteScroll
                dataLength={tweets.length}
                next={fetchNewTweets}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
            >
                {tweets.map(tweet => (
                    <TweetCard key={tweet.id} {...tweet} />
                ))}
            </InfiniteScroll>
        </ul>
    )
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short"})

type HeartButtonProps = {
    onClick: () => void
    isLoading: boolean
    likedByMe: boolean
    likeCount: number
}


function HeartButton({ likedByMe, likeCount, isLoading, onClick }: HeartButtonProps ) {
    const session = useSession()
    const HeartIcon = likedByMe ? VscHeartFilled : VscHeart

    if(session.status !== "authenticated") {
        return <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
            <HeartIcon className="text-red-500" />
            <span>{likeCount}</span>
        </div>
    }

    return (
        <button
          disabled={isLoading}
          onClick={onClick}
          className={`-ml-2 group items-center gap-1 self-start flex transition-colors duration-200 ${likedByMe ? "text-red-500" : "text-gray-500"} hover:text-red-400 focus-visible:text-red-400`}
          >

            <IconHoverEffect red>
                <HeartIcon className={`transition-colors duration-200 ${likedByMe ? "fill-red-500" : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"}`} />
                <span>{likeCount}</span>
            </IconHoverEffect>

        </button>
    )
}

function TweetCard({id, user, content, createdAt, likeCount, likedByMe}: Tweet) {
    const trpcUtils = api.useContext()
    const toggleLike = api.tweet.toggleLike.useMutation({
        onSuccess: ({ addedLike }) => {
            const updateData: Parameters<typeof trpcUtils.tweet.infiniteFeed.setInfiniteData>[1] = (oldData) => {
                if(oldData == null) return

                const countModifier = addedLike  ? 1 : -1

                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        tweets: page.tweets.map(tweet => {
                            if (tweet.id === id) {
                                return {
                                    ...tweet,
                                    likeCount: tweet.likeCount + countModifier,
                                    likedByMe: addedLike
                                }
                            }

                            return tweet
                        })
                    }))
                }
            }
            trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData)
        }
    })

    function handleToggleLike() {
        toggleLike.mutate( { id } )
    }

    return (
        <li className="flex gap-4 border-b p-4">
            <Link href={`/profile/${id}`}>
                <ProfileImage src={user.image}/>
            </Link>
            <div className="flex flex-grow flex-col">
                <div className="flex-gap-1">
                    <Link 
                        className="font-bold hover:underline focus-visible:underline outline-none" 
                        href={`/profile/${id}`}
                    >
                        {user.name}
                    </Link>
                    <span className="text-gray-500 px-1"> - </span>
                    <span className="text-gray-500">
                        {dateTimeFormatter.format(createdAt)}
                    </span>
                </div>
                <p className="whitespace-pre-wrap">{ content }</p>
                <HeartButton 
                  onClick={handleToggleLike}
                  isLoading={toggleLike.isLoading} 
                  likedByMe={likedByMe}
                  likeCount={likeCount}/>
            </div>
        </li>
    )
}