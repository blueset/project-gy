import { gql, useLazyQuery } from "@apollo/client";
import { MusicFile } from "../../models/MusicFile";
import { AppBar, Button, Card, CardActions, Divider, Tab, Tabs } from "@material-ui/core";
import { useCallback, useEffect } from "react";
import { useNamedState } from "../../frontendUtils/hooks";
import { makeStyles } from "@material-ui/core/styles";
import { TabContext, TabPanel } from "@material-ui/lab";
import InfoPanel from "./musicFilesDetails/info";
import { SongFragments } from "../../graphql/fragments";
import CoverArtPanel from "./musicFilesDetails/coverArt";
import LyricsPanel from "./musicFilesDetails/lyrics";
import PlaylistsPanel from "./musicFilesDetails/playlists";

const SINGLE_FILE_DATA = gql`
  query($id: Int!) {
    musicFile(id: $id) {
      id
      path
      trackName
      trackSortOrder
      artistName
      artistSortOrder
      albumName
      albumSortOrder
      songId
      hasCover
      duration
      song {
        ...SelectSongEntry
      }
      album {
        id
        coverUrl
      }
      
      lrcxLyrics: lyricsText(ext: "lrcx")
      lrcLyrics: lyricsText(ext: "lrc")
      
      playlists {
        slug
        name
      }
    }
  }
  
  ${SongFragments.SelectSongEntry}
`;

const useStyle = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(2),
  },
}));

type ExtendedMusicFile =
  Pick<MusicFile, "id" | "path" | "trackName" | "trackSortOrder" | "artistName" | "artistSortOrder" | "albumName" | "albumSortOrder" | "songId" | "hasCover" | "song" | "album" | "duration" | "playlists">
  & {
  lrcLyrics?: string;
  lrcxLyrics?: string;
};

interface MusicFileDetailsProps {
  fileId?: number;
}

export default function MusicFileDetails({ fileId }: MusicFileDetailsProps) {

  const styles = useStyle();

  const [getFile, fileData] = useLazyQuery<{
    musicFile: ExtendedMusicFile,
  }>(SINGLE_FILE_DATA, { variables: { id: fileId } });

  useEffect(() => {
    if (fileId != null) {
      getFile();
    }
  }, [fileId, getFile]);

  const [tabIndex, setTabIndex] = useNamedState("info", "tabIndex");

  const onTabSwitch = useCallback((event, newValue: string) => {
    setTabIndex(newValue);
  }, [setTabIndex]);

  return <>
    <Card className={styles.card}>
      <TabContext value={tabIndex}>
        <AppBar position="static" color="default">
          <Tabs value={tabIndex} onChange={onTabSwitch}
                aria-label="Music file details tabs"
                indicatorColor="secondary"
                textColor="secondary"
                variant="scrollable"
                scrollButtons="auto"
          >
            <Tab label="Info" value="info" />
            <Tab label="Cover art" value="cover-art" />
            <Tab label="Lyrics" value="lyrics" />
            <Tab label="Playlists" value="playlists" />
          </Tabs>
        </AppBar>
        <TabPanel value="info">
          <InfoPanel
            fileId={fileId}
            path={fileData.data?.musicFile.path ?? ""}
            trackName={fileData.data?.musicFile.trackName ?? ""}
            trackSortOrder={fileData.data?.musicFile.trackSortOrder ?? ""}
            artistName={fileData.data?.musicFile.artistName ?? ""}
            artistSortOrder={fileData.data?.musicFile.artistSortOrder ?? ""}
            albumName={fileData.data?.musicFile.albumName ?? ""}
            albumSortOrder={fileData.data?.musicFile.albumSortOrder ?? ""}
            song={fileData.data?.musicFile.song ?? null}
            albumId={fileData.data?.musicFile.album?.id ?? null}
            refresh={fileData.refetch}
          />
        </TabPanel>
        <TabPanel value="cover-art">
          <CoverArtPanel
            fileId={fileId}
            trackName={fileData.data?.musicFile.trackName ?? ""}
            hasCover={fileData.data?.musicFile.hasCover ?? false}
            hasSong={(fileData.data?.musicFile.song ?? null) !== null}
            hasAlbum={(fileData.data?.musicFile.album ?? null) !== null}
            songCoverUrl={fileData.data?.musicFile.song?.coverUrl ?? null}
            albumCoverUrl={fileData.data?.musicFile.album?.coverUrl ?? null}
            refresh={fileData.refetch}
          />
        </TabPanel>
        <TabPanel value="lyrics">
          <LyricsPanel
            fileId={fileId}
            title={fileData.data?.musicFile.trackName ?? ""}
            artists={fileData.data?.musicFile.artistName ?? ""}
            lrcLyrics={fileData.data?.musicFile.lrcLyrics}
            lrcxLyrics={fileData.data?.musicFile.lrcxLyrics}
            duration={fileData.data?.musicFile.duration ?? 0}
            songId={fileData.data?.musicFile.song?.id ?? null}
            refresh={fileData.refetch}
          />
        </TabPanel>
        <TabPanel value="playlists">
          <PlaylistsPanel fileId={fileId} playlists={fileData.data?.musicFile.playlists ?? []} refresh={fileData.refetch} />
        </TabPanel>
      </TabContext>
      <Divider />
      <CardActions>
        <Button color="secondary">Mark as reviewed</Button>
      </CardActions>
    </Card>
  </>;
}