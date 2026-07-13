import RoomClient from "./RoomClient";

export default function RoomPage({ params }) {
  const code = params.code.toUpperCase();
  return <RoomClient code={code} />;
}
