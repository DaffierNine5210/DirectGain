import { Ionicons } from '@expo/vector-icons';
import {
  useEffect,
  useState,
} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type { ChatMessage } from '../../types/Messaging';
import {
  createConversationAttachmentSignedUrl,
  formatAttachmentByteSize,
  getDocumentTypeLabel,
} from '../../services/messaging/conversationAttachmentStorage';
import {
  hasValidLocationCoordinates,
} from '../../services/messaging/conversationLocation';

type Props = {
  message: ChatMessage;

  onPress?: (
    message: ChatMessage,
  ) => void;
};

function getStatusText(
  status:
    ChatMessage['status'],
):
  | 'Sending…'
  | 'Delivered'
  | 'Read'
  | null {
  if (
    status ===
    'sending'
  ) {
    return 'Sending…';
  }

  /*
   * Older/local messages may still
   * use "sent".
   *
   * Once the message has successfully
   * left the device, Direct Gain shows
   * the clearer user-facing wording
   * "Delivered".
   */
  if (
    status ===
      'sent' ||
    status ===
      'delivered'
  ) {
    return 'Delivered';
  }

  if (
    status ===
    'read'
  ) {
    return 'Read';
  }

  return null;
}

function getSystemIcon(
  kind:
    ChatMessage['kind'],
):
  | 'information-circle-outline'
  | 'location-outline'
  | 'image-outline'
  | 'cash-outline'
  | 'chatbubble-outline' {
  if (
    kind ===
    'location'
  ) {
    return 'location-outline';
  }

  if (
    kind ===
    'image'
  ) {
    return 'image-outline';
  }

  if (
    kind ===
    'offer'
  ) {
    return 'cash-outline';
  }

  if (
    kind ===
    'system'
  ) {
    return 'information-circle-outline';
  }

  return 'chatbubble-outline';
}

export default function MessageBubble({
  message,
  onPress,
}: Props) {
  const isCurrentUser =
    message.sender ===
    'current-user';

  const isSystem =
    message.sender ===
      'system' ||
    message.kind ===
      'system';

  const statusText =
    getStatusText(
      message.status,
    );

  if (
    isSystem
  ) {
    return (
      <View
        style={
          styles.systemWrapper
        }
      >
        <View
          style={
            styles.systemBubble
          }
        >
          <Ionicons
            name={
              getSystemIcon(
                message.kind,
              )
            }
            size={
              15
            }
            color={
              colors.primary
            }
          />

          <Text
            style={
              styles.systemText
            }
          >
            {message.text}
          </Text>
        </View>

        <Text
          style={
            styles.systemTime
          }
        >
          {message.createdAt}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageRow,

        isCurrentUser
          ? styles.currentUserRow
          : styles.participantRow,
      ]}
    >
      <View
        style={[
          styles.bubbleGroup,

          isCurrentUser
            ? styles.currentUserGroup
            : styles.participantGroup,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            message.kind ===
            'file'
              ? `File: ${message.fileName ?? 'Document'}`
              : message.kind ===
                  'location'
                ? hasValidLocationCoordinates(
                    message.latitude,
                    message.longitude,
                  )
                  ? `Location: ${message.locationLabel ?? 'Current location'}`
                  : 'Location unavailable'
              : message.text
                ? `Message: ${message.text}`
                : 'Open message'
          }
          onPress={() => {
            if (
              message.kind ===
                'location' &&
              !hasValidLocationCoordinates(
                message.latitude,
                message.longitude,
              )
            ) {
              return;
            }

            onPress?.(
              message,
            );
          }}
          style={({
            pressed,
          }) => [
            styles.bubble,

            isCurrentUser
              ? styles.currentUserBubble
              : styles.participantBubble,

            pressed &&
              styles.pressed,
          ]}
        >
          {message.kind ===
          'image' ? (
            <ConversationImage
              message={
                message
              }
            />
          ) : null}

          {message.kind ===
          'file' ? (
            <View
              style={
                styles.fileAttachment
              }
            >
              <View
                style={
                  styles.specialIcon
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={
                    17
                  }
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.fileDetails
                }
              >
                <Text
                  style={
                    styles.fileName
                  }
                  numberOfLines={
                    1
                  }
                >
                  {message.fileName ??
                    'Document'}
                </Text>

                <Text
                  style={
                    styles.fileMeta
                  }
                  numberOfLines={
                    1
                  }
                >
                  {[
                    getDocumentTypeLabel(
                      message.fileMimeType,
                      message.fileExtension,
                    ),
                    formatAttachmentByteSize(
                      message.fileByteSize,
                    ),
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      ' · ',
                    )}
                </Text>
              </View>
            </View>
          ) : null}

          {message.kind ===
          'location' ? (
            <View
              style={
                styles.fileAttachment
              }
            >
              <View
                style={
                  styles.specialIcon
                }
              >
                <Ionicons
                  name="location-outline"
                  size={
                    17
                  }
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.fileDetails
                }
              >
                <Text
                  style={
                    styles.fileName
                  }
                  numberOfLines={
                    2
                  }
                >
                  {hasValidLocationCoordinates(
                    message.latitude,
                    message.longitude,
                  )
                    ? message.locationLabel ??
                      'Current location'
                    : 'Location unavailable'}
                </Text>

                {hasValidLocationCoordinates(
                  message.latitude,
                  message.longitude,
                ) &&
                message.locationAddress ? (
                  <Text
                    style={
                      styles.fileMeta
                    }
                    numberOfLines={
                      2
                    }
                  >
                    {message.locationAddress}
                  </Text>
                ) : null}

                {hasValidLocationCoordinates(
                  message.latitude,
                  message.longitude,
                ) ? (
                  <Text
                    style={
                      styles.fileMeta
                    }
                  >
                    View location
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {message.kind ===
          'offer' ? (
            <View
              style={
                styles.specialHeader
              }
            >
              <View
                style={
                  styles.specialIcon
                }
              >
                <Ionicons
                  name="cash-outline"
                  size={
                    17
                  }
                  color={
                    colors.primary
                  }
                />
              </View>

              <Text
                style={
                  styles.specialTitle
                }
              >
                Direct Gain offer
              </Text>
            </View>
          ) : null}

          {message.text ? (
            <Text
              style={[
                styles.messageText,

                isCurrentUser &&
                  styles.currentUserText,
              ]}
            >
              {message.text}
            </Text>
          ) : null}
        </Pressable>

        <View
          style={[
            styles.metaRow,

            isCurrentUser
              ? styles.metaRowCurrentUser
              : styles.metaRowParticipant,
          ]}
        >
          {message.isEdited ? (
            <Text
              style={
                styles.editedText
              }
            >
              Edited
            </Text>
          ) : null}

          <Text
            style={
              styles.messageTime
            }
          >
            {message.createdAt}
          </Text>

          {isCurrentUser &&
          statusText ? (
            <>
              <Text
                style={
                  styles.metaSeparator
                }
              >
                ·
              </Text>

              <Text
                style={[
                  styles.statusText,

                  message.status ===
                    'read' &&
                    styles.readStatusText,

                  message.status ===
                    'sending' &&
                    styles.sendingStatusText,
                ]}
              >
                {statusText}
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ConversationImage({
  message,
}: {
  message: ChatMessage;
}) {
  const [
    signedUrl,
    setSignedUrl,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isUnavailable,
    setIsUnavailable,
  ] =
    useState(
      false,
    );

  const localImage =
    message.image;

  const attachmentPath =
    message.attachmentPath;

  useEffect(
    () => {
      let cancelled =
        false;

      if (
        localImage ||
        !attachmentPath
      ) {
        setSignedUrl(
          null,
        );

        setIsUnavailable(
          false,
        );

        return () => {
          cancelled =
            true;
        };
      }

      async function loadSignedUrl() {
        if (
          !attachmentPath
        ) {
          return;
        }

        const url =
          await createConversationAttachmentSignedUrl(
            attachmentPath,
          );

        if (
          cancelled
        ) {
          return;
        }

        if (!url) {
          setIsUnavailable(
            true,
          );

          setSignedUrl(
            null,
          );

          return;
        }

        setIsUnavailable(
          false,
        );

        setSignedUrl(
          url,
        );
      }

      void loadSignedUrl();

      return () => {
        cancelled =
          true;
      };
    },

    [
      attachmentPath,
      localImage,
    ],
  );

  if (
    localImage
  ) {
    return (
      <Image
        source={
          localImage
        }
        style={
          styles.messageImage
        }
      />
    );
  }

  if (
    signedUrl
  ) {
    return (
      <Image
        source={{
          uri:
            signedUrl,
        }}
        style={
          styles.messageImage
        }
        onError={() => {
          setIsUnavailable(
            true,
          );
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.messageImage,
        styles.imagePlaceholder,
      ]}
    >
      <Ionicons
        name="image-outline"
        size={22}
        color={
          colors.primary
        }
      />

      <Text
        style={
          styles.imagePlaceholderText
        }
      >
        {isUnavailable
          ? 'Photo unavailable'
          : 'Photo'}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    messageRow: {
      width:
        '100%',

      marginBottom:
        15,
    },

    currentUserRow: {
      alignItems:
        'flex-end',
    },

    participantRow: {
      alignItems:
        'flex-start',
    },

    bubbleGroup: {
      maxWidth:
        '82%',
    },

    currentUserGroup: {
      alignItems:
        'flex-end',
    },

    participantGroup: {
      alignItems:
        'flex-start',
    },

    bubble: {
      minWidth:
        54,

      paddingHorizontal:
        14,

      paddingVertical:
        11,

      borderRadius:
        19,

      overflow:
        'hidden',
    },

    currentUserBubble: {
      borderBottomRightRadius:
        6,

      backgroundColor:
        colors.primary,
    },

    participantBubble: {
      borderBottomLeftRadius:
        6,

      borderWidth:
        1,

      borderColor:
        'rgba(255, 255, 255, 0.08)',

      backgroundColor:
        '#151A16',
    },

    messageText: {
      color:
        colors.text,

      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        '600',
    },

    currentUserText: {
      color:
        '#080B09',

      fontWeight:
        '700',
    },

    messageImage: {
      width:
        230,

      height:
        170,

      marginHorizontal:
        -14,

      marginTop:
        -11,

      marginBottom:
        10,

      backgroundColor:
        '#182019',
    },

    imagePlaceholder: {
      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,
    },

    imagePlaceholderText: {
      color:
        colors.primary,

      fontSize:
        12,

      fontWeight:
        '800',
    },

    specialHeader: {
      marginBottom:
        8,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    specialIcon: {
      width:
        30,

      height:
        30,

      marginRight:
        8,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.16)',

      backgroundColor:
        'rgba(158, 246, 90, 0.07)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    specialTitle: {
      flex:
        1,

      color:
        colors.text,

      fontSize:
        11,

      fontWeight:
        '900',
    },

    fileAttachment: {
      minWidth:
        168,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    fileDetails: {
      flex:
        1,

      minWidth:
        0,
    },

    fileName: {
      color:
        colors.text,

      fontSize:
        12,

      fontWeight:
        '800',
    },

    fileMeta: {
      marginTop:
        3,

      color:
        colors.textMuted,

      fontSize:
        10,

      fontWeight:
        '700',
    },

    metaRow: {
      marginTop:
        5,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    metaRowCurrentUser: {
      justifyContent:
        'flex-end',
    },

    metaRowParticipant: {
      justifyContent:
        'flex-start',
    },

    messageTime: {
      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '700',
    },

    editedText: {
      marginRight:
        6,

      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '600',
    },

    metaSeparator: {
      marginHorizontal:
        4,

      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '700',
    },

    statusText: {
      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '800',
    },

    readStatusText: {
      color:
        colors.primary,

      fontWeight:
        '900',
    },

    sendingStatusText: {
      opacity:
        0.7,
    },

    systemWrapper: {
      marginVertical:
        11,

      alignItems:
        'center',
    },

    systemBubble: {
      maxWidth:
        '88%',

      paddingHorizontal:
        13,

      paddingVertical:
        9,

      borderRadius:
        15,

      borderWidth:
        1,

      borderColor:
        'rgba(158, 246, 90, 0.12)',

      backgroundColor:
        'rgba(158, 246, 90, 0.045)',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    systemText: {
      flexShrink:
        1,

      marginLeft:
        7,

      color:
        colors.textMuted,

      fontSize:
        9,

      lineHeight:
        14,

      fontWeight:
        '700',

      textAlign:
        'center',
    },

    systemTime: {
      marginTop:
        5,

      color:
        colors.textMuted,

      fontSize:
        8,

      fontWeight:
        '600',
    },

    pressed: {
      opacity:
        0.76,

      transform: [
        {
          scale:
            0.988,
        },
      ],
    },
  });