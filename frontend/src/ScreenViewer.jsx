import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

// const SIGNALING_SERVER_URL = 'http://localhost:3000';
const SIGNALING_SERVER_URL = import.meta.env.VITE_BACKEND_URL;

const ROOM = 'screen-share-room';

export default function ScreenViewer() {
  const socketRef = useRef();
  const pcRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    // Receive remote stream
    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { target: 'screen-sharer', candidate: event.candidate });
      }
    };

    socketRef.current.emit('join');

    // Receive offer from sharer
    socketRef.current.on('offer', async ({ from, sdp }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('answer', { target: from, sdp: pc.localDescription });
    });

    // Receive ICE candidates from sharer
    socketRef.current.on('ice-candidate', async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding ICE candidate', e);
      }
    });

    return () => {
      pc.close();
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Screen Viewer</h2>
      <video ref={videoRef} autoPlay playsInline controls style={{ width: '80vw', border: '1px solid black' }} />
    </div>
  );
}
