import {StyleSheet} from 'react-native';

const colors = {
  deepPeriwinkle: '#5A4FCF',
  softLilac: '#E6E6FA',
  white: '#FFFFFF',
  black: '#000000',
};

const theme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.softLilac,
  },
  button: {
    backgroundColor: colors.deepPeriwinkle,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.deepPeriwinkle,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    color: colors.black,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepPeriwinkle,
    marginBottom: 20,
  },
  text: {
    color: colors.black,
    fontSize: 16,
  },
});

export {colors, theme};
