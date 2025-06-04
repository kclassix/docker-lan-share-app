import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

// const SIGNALING_SERVER_URL = 'http://localhost:3000';
const SIGNALING_SERVER_URL = import.meta.env.VITE_BACKEND_URL;

const ROOM = 'screen-share-room';

export default function ScreenSharer() {
  const socketRef = useRef();
  const pcsRef = useRef({}); // Map of viewerId -> RTCPeerConnection
  const localStreamRef = useRef();

  // const [isSharing, setIsSharing] = useState(false);
  // const [viewers, setViewers] = useState([]);

  // useEffect(() => {
  //   socketRef.current.on('new-viewer', (viewerId) => {
  //     setViewers((v) => [...v, viewerId]);
  //     // existing code ...
  //   });
  //   socketRef.current.on('viewer-left', (viewerId) => {
  //     setViewers((v) => v.filter(id => id !== viewerId));
  //     // existing code ...
  //   });
  // }, []);

  // const startSharing = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  //     localStreamRef.current = stream;
  //     const video = document.getElementById('localVideo');
  //     if (video) video.srcObject = stream;
  //     setIsSharing(true);
  //     // create peers for existing viewers, etc.
  //   } catch {
  //     alert('Failed to start screen share');
  //   }
  // };

  // const stopSharing = () => {
  //   if (localStreamRef.current) {
  //     localStreamRef.current.getTracks().forEach(t => t.stop());
  //     setIsSharing(false);
  //   }
  // };


  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);

    socketRef.current.emit('join');

    // When a new viewer joins, create a peer connection and send offer
    socketRef.current.on('new-viewer', async (viewerId) => {
      console.log('New viewer joined:', viewerId);

      const pc = createPeerConnection(viewerId);
      pcsRef.current[viewerId] = pc;

      // Add all tracks to peer connection
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      // Create offer and send to viewer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', { target: viewerId, sdp: pc.localDescription });
    });

    // Receive answer from viewer
    socketRef.current.on('answer', async ({ from, sdp }) => {
      const pc = pcsRef.current[from];
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // Receive ICE candidates from viewers
    socketRef.current.on('ice-candidate', async ({ from, candidate }) => {
      const pc = pcsRef.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    });

    // Remove disconnected viewer's peer connection
    socketRef.current.on('viewer-left', (viewerId) => {
      console.log('Viewer left:', viewerId);
      if (pcsRef.current[viewerId]) {
        pcsRef.current[viewerId].close();
        delete pcsRef.current[viewerId];
      }
    });

    return () => {
      // Cleanup on unmount
      Object.values(pcsRef.current).forEach((pc) => pc.close());
      socketRef.current.disconnect();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  function createPeerConnection(viewerId) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { target: viewerId, candidate: event.candidate });
      }
    };

    return pc;
  }

  // Get screen stream on mount
  async function getScreen() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      localStreamRef.current = stream;
      // Optional: show local preview
      const video = document.getElementById('localVideo');
      if (video) {
        video.srcObject = stream;
      }
    } catch (err) {
      console.error('Error getting display media', err);
    }
  }
  // getScreen();

  return (
    <div>
      <h2>Screen Sharer (You)</h2>
      <button onClick={() => getScreen()}>share now</button>
      <video id="localVideo" autoPlay muted style={{ width: '80vw', border: '1px solid black' }} />
      {/* <div>
      <h2>Screen Sharer</h2>
      {!isSharing ? (
        <button onClick={startSharing}>Start Sharing</button>
      ) : (
        <button onClick={stopSharing}>Stop Sharing</button>
      )}
      <video id="localVideo" autoPlay muted style={{ width: '80vw', border: '1px solid black', marginTop: 20 }} />
      <div>
        <h4>Viewers connected: {viewers.length}</h4>
        <ul>
          {viewers.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </div>
    </div> */}
    </div>
  );
}
