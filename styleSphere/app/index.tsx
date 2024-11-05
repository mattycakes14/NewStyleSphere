import { View } from "react-native";
import SwipeDeck from './SwipeDeck'; // Import SwipeDeck
import Login from "@/components/Login";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Login />
      <SwipeDeck />
    </View>
  );
}
