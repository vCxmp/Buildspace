import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { StatusBar } from 'expo-status-bar';

const MatchScreen = () => {
  const router = useRouter();
  const confettiRef = useRef(null);

  useEffect(() => {
    // Start the confetti animation when the component mounts
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  }, []);

  const handleContinue = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        autoStart={false}
        fadeOut={true}
        colors={['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#7B68EE']}
      />
      <Text style={styles.matchText}>It's a Match!</Text>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MatchScreen; 