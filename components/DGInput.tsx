import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type DGInputIconName = React.ComponentProps<typeof Ionicons>['name'];

type DGInputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: DGInputIconName;
  rightIcon?: DGInputIconName;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const DGInput = forwardRef<TextInput, DGInputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputContainerStyle,
      inputStyle,
      editable = true,
      secureTextEntry = false,
      ...textInputProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = Boolean(errorMessage);
    const isPasswordInput = secureTextEntry;
    const displayedRightIcon = isPasswordInput
      ? isPasswordVisible
        ? 'eye-off-outline'
        : 'eye-outline'
      : rightIcon;

    function handleRightIconPress() {
      if (isPasswordInput) {
        setIsPasswordVisible((currentValue) => !currentValue);
        return;
      }

      onRightIconPress?.();
    }

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.focusedInputContainer,
            hasError && styles.errorInputContainer,
            !editable && styles.disabledInputContainer,
            inputContainerStyle,
          ]}
        >
          {leftIcon ? (
            <Ionicons
              name={leftIcon}
              size={20}
              color={
                hasError
                  ? styles.errorText.color
                  : isFocused
                    ? colors.primary
                    : colors.textMuted
              }
              style={styles.leftIcon}
            />
          ) : null}

          <TextInput
            ref={ref}
            editable={editable}
            secureTextEntry={
              isPasswordInput ? !isPasswordVisible : secureTextEntry
            }
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={[styles.input, inputStyle]}
            onFocus={(event) => {
              setIsFocused(true);
              textInputProps.onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              textInputProps.onBlur?.(event);
            }}
            {...textInputProps}
          />

          {displayedRightIcon ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                isPasswordInput
                  ? isPasswordVisible
                    ? 'Hide password'
                    : 'Show password'
                  : 'Input action'
              }
              activeOpacity={0.7}
              disabled={!isPasswordInput && !onRightIconPress}
              onPress={handleRightIconPress}
              style={styles.rightIconButton}
            >
              <Ionicons
                name={displayedRightIcon}
                size={20}
                color={
                  hasError
                    ? styles.errorText.color
                    : isFocused
                      ? colors.primary
                      : colors.textMuted
                }
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

DGInput.displayName = 'DGInput';

export default DGInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    marginBottom: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },

  inputContainer: {
    width: '100%',
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  focusedInputContainer: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  errorInputContainer: {
    borderColor: '#E5484D',
  },

  disabledInputContainer: {
    opacity: 0.5,
  },

  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },

  leftIcon: {
    marginRight: 10,
  },

  rightIconButton: {
    width: 36,
    height: 36,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helperText: {
    marginTop: 7,
    marginLeft: 4,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  errorText: {
    marginTop: 7,
    marginLeft: 4,
    color: '#E5484D',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});