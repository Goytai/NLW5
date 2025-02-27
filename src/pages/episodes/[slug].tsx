import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'

import { usePlayer } from '../../contexts/PlayerContext'

import {format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../../services/api'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

import styles from './episodes.module.sass'

type Episode = {
    id: string,
    title: string,
    thumbnail: string,
    members: string,
    publishedAt: string,
    duration: number,
    durationAsString: string,
    description: string,
    url: string
}

type EpisodeProps = {
    episode: Episode
}

export default function Episode ({episode}: EpisodeProps) {
    const { play } = usePlayer()

    return (
        <div className={styles.episodeContainer}>

            <Head>
                <meta property="og:locale" content="pt_BR" />

                <meta property="og:url" content="https://nlw5.vercel.app/"/>

                <meta property="og:title" content={`Podcastr | ${episode.title}`}/>
                <meta property="og:site_name" content="Podcastr"/>

                <meta property="og:image" content={episode.thumbnail}/>
                <meta property="og:image:type" content="image/jpeg"/>
                <meta property="og:image:width" content="1280"/>
                <meta property="og:image:height" content="720"/>

                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href='/'>
                        <button type="button">
                            <img src="/arrow-left.svg" alt="Voltar"/>
                        </button>
                    </Link>

                    <Image
                        width={700}
                        height={160}
                        src={episode.thumbnail} 
                        objectFit="cover"
                    />

                    <button type="button">
                        <img src="/play.svg" onClick={() => play(episode)} alt="Tocar Episódio"/>
                    </button>
                </div>

                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {

    const {data} = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const {slug} = ctx.params
    const {data} = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24
    }
}