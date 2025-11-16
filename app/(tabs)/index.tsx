import { getAllBooks } from '@/src/data/booksIndex';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';
import AppText from '@/components/app-text';



export default function HomeScreen() {

  const [fontsLoaded] = Font.useFonts({
    'Jersey20-Regular': require('../../assets/fonts/Jersey20-Regular.ttf'),
  })

  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  const books = getAllBooks();

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>My Library</AppText>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.bookCard}
            onPress={() => router.push(`/reader/${item.id}`)}
          >
            <AppText style={styles.bookTitle}>{item.title}</AppText>
            <AppText style={styles.bookAuthor}>{item.author}</AppText>
            <AppText style={styles.bookChapters}>
              {item.chapters.length} chapters
            </AppText>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Jersey20-Regular'
  },
  bookCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bookChapters: {
    fontSize: 14,
    color: '#999',
  },
});
