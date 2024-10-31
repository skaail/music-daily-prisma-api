import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import { io } from '..'

export const albumRoute = express.Router()
const prisma = new PrismaClient()

albumRoute.get('/nao-ouvidos', async  (req: Request, res: Response) => {
    const albums = await prisma.album.findMany({
        include: {
            banda: true,
            songs: true
        },
        orderBy: {
            nome: 'asc'
        },
        where: {
            nota: {equals: 0.0}
        }
    })
    res.send(albums)
})

albumRoute.patch('/:id', async (req: Request, res: Response):Promise<any> => {
    const id = parseInt(req.params.id);
    const { nota } = req.body;
    nota as number
    

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const albumUpdate = await prisma.album.update({
            where: { id: id },
            data: {  nota: nota.toFixed(2) }
        });

        return res.json({ message: "Album deletado", album: albumUpdate });
    } catch (error: any) {
        console.log(error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Album não encontrado" });
        }
        return res.status(500).json({ error: "Não foi possivel dar nota" });
    }
})

albumRoute.get('/', async  (req: Request, res: Response) => {
    const albums = await prisma.album.findMany({
        include: {
            banda: true,
            songs: true
        },
        orderBy: {
            nota: 'desc'
        },
        where: {
            nota: {gt: 0}
        }
    })

    
    res.send(albums)
})

albumRoute.delete('/:id', async (req: Request, res: Response):Promise<any> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const deleteAlbum = await prisma.album.delete({
            where: { id: id },
        });

        return res.json({ message: "Album deletado", album: deleteAlbum });
    } catch (error: any) {
        console.log(error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Album não encontrado" });
        }
        return res.status(500).json({ error: "Não foi possível deletar o album" });
    }
})


albumRoute.post('/', async (req: Request, res: Response) => {

    const { nome, banda } = req.body;

    const album = await searchAlbum(nome, banda)

    const album_nome = album.name
    const album_link = album.uri
    const album_art = album.images[0].url
    
    const banda_nome = album.artists[0].name
    const banda_id = album.artists[0].id
    const banda_image = await getBandImage(banda_id)
    1

    const trackData = await getAlbumTrack(album_link)
    const songs = trackData.items

    const songCreationData = songs.map((song: { name: string }) => ({
        name: song.name,
        link: "a",
    }));

    try {
        const band = await prisma.banda.upsert({
            where: { nome: banda_nome },
            update: { foto: banda_image.images[0].url },
            create: { 
                nome: banda_nome,
                foto: banda_image.images[0].url,
             },
        });

        const album = await prisma.album.create({
            data: {
                nome: album_nome,
                link: album_link,
                capa: album_art,
                nota: 0.0,
                banda: {
                    connect: { id: band.id },
                },
                songs: {
                    create: songCreationData,
                },
            },
            include: {
                banda: true,
                songs: true,
            }
        });

        console.log(nome, banda)
        io.emit('newAlbum', album)
        res.json(album);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating album and band' });
    }
    }
)


async function getSpotifyAuthToken(clientId: String, clientSecret: String) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });
  
    const data = await response.json();
    return data.access_token;
}


async function searchAlbum(name: String, banda: String) {
    const token = await getSpotifyAuthToken("47d629387eff4cc2a731e7f2c290302e", "5bcf17b2ac36460480687f83171004ae")

    const response = await fetch(`https://api.spotify.com/v1/search?q=${name}${banda}&type=album&limit=1`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    const data = await response.json()

    return data.albums.items[0]
}

async function getAlbumTrack(uri: String) {
    const token = await getSpotifyAuthToken("47d629387eff4cc2a731e7f2c290302e", "5bcf17b2ac36460480687f83171004ae")

    const albumId = uri.includes("spotify:album:") ? uri.split("spotify:album:")[1] : uri;

    const response = await fetch(` https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    const data = await response.json()

    return data
}

async function getBandImage(id: String){
    const token = await getSpotifyAuthToken("47d629387eff4cc2a731e7f2c290302e", "5bcf17b2ac36460480687f83171004ae")


    const response = await fetch(` https://api.spotify.com/v1/artists/${id}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    const data = await response.json()

    return data
}