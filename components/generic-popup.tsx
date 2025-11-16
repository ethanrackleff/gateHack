import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';


export type GenericPopupProps = {
  visible: boolean,
  onRequestClose: any,
  children: any,
  backdropOpacity?: number 
}

export default function GenericPopup({
  visible,
  onRequestClose,
  children,
  backdropOpacity = 0.3
}: GenericPopupProps) {
  if (!visible) return null

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    menuContainer: {
      borderRadius: 8,
      padding: 8,
      backgroundColor: '#fcc',
        // shadow for iOS
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      // elevation for Android
      elevation: 4,
    }
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={[styles.backdrop, { backgroundColor: `rgba(0,0,0,${backdropOpacity})` }]}>
          
          {/* Second touchable: prevents backdrop press when tapping inside menu */}
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              {children}
            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  ); 
}
