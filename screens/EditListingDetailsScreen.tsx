import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DGButton from '../components/DGButton';
import DGChip from '../components/DGChip';
import DGHeader from '../components/DGHeader';
import DGInput from '../components/DGInput';
import DGSkeleton from '../components/DGSkeleton';

import useTabBarVisibility from '../hooks/useTabBarVisibility';

import type { MarketStackParamList } from '../navigation/MarketStack';

import {
  getOwnMarketListing,
  updateOwnMarketListingDetails,
} from '../services/market/marketListingsRepository';

import {
  LISTING_FORM_MAX_DESCRIPTION,
  LISTING_FORM_MAX_STATE,
  LISTING_FORM_MAX_SUBCATEGORY,
  LISTING_FORM_MAX_SUBURB,
  LISTING_FORM_MAX_TITLE,
  listingFormSnapshotFromValues,
  listingFormSnapshotsEqual,
  parseListingPrice,
  sanitizeListingPriceInput,
  validateListingForm,
  type ListingFormErrors,
  type ListingFormSnapshot,
} from '../utils/market/listingFormValidation';

import {
  MARKET_LISTING_CATEGORIES,
  MARKET_LISTING_CONDITIONS,
  type MarketListingCategory,
  type MarketListingCondition,
} from '../types/marketListing';

import {
  alpha,
  layout,
  palette,
  radius,
  spacing,
  surface,
  textColor,
  typography,
} from '../theme/designSystem';

type Props = NativeStackScreenProps<
  MarketStackParamList,
  'EditListingDetails'
>;

export default function EditListingDetailsScreen({
  navigation,
  route,
}: Props) {
  const { listingId } = route.params;
  const { showTabBar } = useTabBarVisibility();

  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const persistedRef = useRef<ListingFormSnapshot | null>(null);
  const formRef = useRef<ListingFormSnapshot | null>(null);

  const [loadState, setLoadState] = useState<
    'loading' | 'ready' | 'unavailable' | 'error'
  >('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ListingFormErrors>({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<MarketListingCategory | null>(null);
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] =
    useState<MarketListingCondition | null>(null);
  const [priceText, setPriceText] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [allowsOffers, setAllowsOffers] = useState(true);

  const currentSnapshot: ListingFormSnapshot = {
    title,
    description,
    category,
    subcategory,
    condition,
    priceText,
    suburb,
    state,
    pickupAvailable,
    deliveryAvailable,
    allowsOffers,
  };

  formRef.current = currentSnapshot;

  const dirty =
    persistedRef.current != null &&
    !listingFormSnapshotsEqual(
      currentSnapshot,
      persistedRef.current,
    );

  const applySnapshot = useCallback((snapshot: ListingFormSnapshot) => {
    setTitle(snapshot.title);
    setDescription(snapshot.description);
    setCategory(snapshot.category);
    setSubcategory(snapshot.subcategory);
    setCondition(snapshot.condition);
    setPriceText(snapshot.priceText);
    setSuburb(snapshot.suburb);
    setState(snapshot.state);
    setPickupAvailable(snapshot.pickupAvailable);
    setDeliveryAvailable(snapshot.deliveryAvailable);
    setAllowsOffers(snapshot.allowsOffers);
  }, []);

  const loadListing = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    setErrors({});

    const result = await getOwnMarketListing(listingId);

    if (!mountedRef.current) {
      return;
    }

    if (result.error || !result.listing) {
      setLoadError(
        result.error ?? "Couldn't load this listing.",
      );
      setLoadState('error');
      return;
    }

    if (
      result.listing.listing.status !== 'active' &&
      result.listing.listing.status !== 'paused'
    ) {
      setLoadState('unavailable');
      return;
    }

    const snapshot = listingFormSnapshotFromValues(
      result.listing.listing,
    );
    persistedRef.current = snapshot;
    applySnapshot(snapshot);
    setLoadState('ready');
  }, [applySnapshot, listingId]);

  useFocusEffect(
    useCallback(() => {
      showTabBar();
    }, [showTabBar]),
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadListing();

    return () => {
      mountedRef.current = false;
    };
  }, [loadListing]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (event) => {
        if (allowLeaveRef.current || savingRef.current) {
          if (savingRef.current) {
            event.preventDefault();
          }
          return;
        }

        const persisted = persistedRef.current;
        const current = formRef.current;

        if (
          !persisted ||
          !current ||
          listingFormSnapshotsEqual(current, persisted)
        ) {
          return;
        }

        event.preventDefault();

        Alert.alert(
          'Discard changes?',
          "Your changes to this listing haven't been saved.",
          [
            {
              text: 'Keep editing',
              style: 'cancel',
            },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                allowLeaveRef.current = true;
                navigation.goBack();
              },
            },
          ],
        );
      },
    );

    return unsubscribe;
  }, [navigation]);

  async function handleSave() {
    if (savingRef.current || loadState !== 'ready') {
      return;
    }

    Keyboard.dismiss();

    const snapshot = formRef.current;

    if (!snapshot) {
      return;
    }

    const nextErrors = validateListingForm(snapshot);

    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }

    const parsed = parseListingPrice(snapshot.priceText);

    if (
      !snapshot.category ||
      !snapshot.condition ||
      !parsed.ok
    ) {
      return;
    }

    if (
      persistedRef.current &&
      listingFormSnapshotsEqual(snapshot, persistedRef.current)
    ) {
      allowLeaveRef.current = true;
      navigation.goBack();
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setErrors({});

    const result = await updateOwnMarketListingDetails(listingId, {
      title: snapshot.title,
      description: snapshot.description,
      category: snapshot.category,
      subcategory: snapshot.subcategory,
      condition: snapshot.condition,
      price: parsed.amount,
      allowsOffers: snapshot.allowsOffers,
      pickupAvailable: snapshot.pickupAvailable,
      deliveryAvailable: snapshot.deliveryAvailable,
      suburb: snapshot.suburb,
      state: snapshot.state,
    });

    if (!mountedRef.current) {
      return;
    }

    savingRef.current = false;
    setSaving(false);

    if (result.error || !result.listing) {
      setErrors({
        form:
          result.error ??
          'This listing could not be saved. Try again.',
      });
      return;
    }

    persistedRef.current = listingFormSnapshotFromValues(
      result.listing.listing,
    );
    allowLeaveRef.current = true;
    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
    >
      <DGHeader
        showBackButton
        title="Edit Details"
        onBackPress={() => {
          navigation.goBack();
        }}
        style={styles.header}
        topRowStyle={styles.headerRow}
      />

      {loadState === 'loading' ? (
        <View style={styles.card}>
          <DGSkeleton width="36%" height={12} />
          <DGSkeleton width="88%" height={18} />
          <DGSkeleton width="72%" height={18} />
        </View>
      ) : loadState === 'error' ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>
            This listing isn't available
          </Text>
          <Text style={styles.emptyBody}>
            {loadError ?? "Couldn't load this listing."}
          </Text>
          <Pressable
            onPress={() => {
              void loadListing();
            }}
            style={styles.retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading listing"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : loadState === 'unavailable' ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>
            This listing can't be edited
          </Text>
          <Text style={styles.emptyBody}>
            Only active or paused listings can be edited here.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}
          >
            <DGInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="What are you selling?"
              maxLength={LISTING_FORM_MAX_TITLE}
              editable={!saving}
              errorMessage={errors.title}
              autoCapitalize="sentences"
            />

            <DGInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Condition, inclusions, and anything a buyer should know"
              maxLength={LISTING_FORM_MAX_DESCRIPTION}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!saving}
              errorMessage={errors.description}
              helperText={
                errors.description
                  ? undefined
                  : `${description.trim().length}/${LISTING_FORM_MAX_DESCRIPTION}`
              }
              autoCapitalize="sentences"
              inputContainerStyle={styles.descriptionInput}
              inputStyle={styles.descriptionField}
            />

            <Text style={styles.section}>Category</Text>
            <View style={styles.chipWrap}>
              {MARKET_LISTING_CATEGORIES.map((value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={value}
                  selected={category === value}
                  disabled={saving}
                  onPress={() => {
                    setCategory(value);
                  }}
                  style={styles.chip}
                />
              ))}
            </View>
            {errors.category ? (
              <Text style={styles.error}>{errors.category}</Text>
            ) : null}

            <DGInput
              label="Type"
              value={subcategory}
              onChangeText={setSubcategory}
              placeholder="e.g. Mountain bike, sofa, iPhone"
              maxLength={LISTING_FORM_MAX_SUBCATEGORY}
              editable={!saving}
              errorMessage={errors.subcategory}
              helperText={
                errors.subcategory
                  ? undefined
                  : 'Describe the item type. This is saved as the listing type.'
              }
              autoCapitalize="sentences"
            />

            <Text style={styles.section}>Condition</Text>
            <View style={styles.chipWrap}>
              {MARKET_LISTING_CONDITIONS.map((value) => (
                <DGChip
                  key={value}
                  size="compact"
                  label={value}
                  selected={condition === value}
                  disabled={saving}
                  onPress={() => {
                    setCondition(value);
                  }}
                  style={styles.chip}
                />
              ))}
            </View>
            {errors.condition ? (
              <Text style={styles.error}>{errors.condition}</Text>
            ) : null}

            <Text style={styles.section}>Price</Text>
            <View style={styles.priceRow}>
              <View
                style={[
                  styles.currencyPrefix,
                  errors.price ? styles.currencyPrefixError : null,
                  saving ? styles.currencyPrefixDisabled : null,
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    saving ? styles.currencySymbolDisabled : null,
                  ]}
                >
                  A$
                </Text>
              </View>
              <View style={styles.priceInputWrap}>
                <DGInput
                  value={priceText}
                  onChangeText={(value) => {
                    setPriceText(sanitizeListingPriceInput(value));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  editable={!saving}
                  errorMessage={errors.price}
                  containerStyle={styles.priceInput}
                />
              </View>
            </View>

            <Text style={styles.section}>Location</Text>
            <Text style={styles.locationHint}>
              Suburb and state only. Do not enter a street address.
            </Text>
            <DGInput
              label="Suburb"
              value={suburb}
              onChangeText={setSuburb}
              placeholder="Suburb"
              maxLength={LISTING_FORM_MAX_SUBURB}
              editable={!saving}
              errorMessage={errors.suburb}
              autoCapitalize="words"
            />
            <DGInput
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="State"
              maxLength={LISTING_FORM_MAX_STATE}
              editable={!saving}
              errorMessage={errors.state}
              autoCapitalize="characters"
            />

            <Text style={styles.section}>Fulfilment</Text>
            <View style={styles.chipWrap}>
              <DGChip
                size="compact"
                label="Pickup available"
                selected={pickupAvailable}
                disabled={saving}
                onPress={() => {
                  setPickupAvailable((current) => !current);
                }}
                style={styles.chip}
              />
              <DGChip
                size="compact"
                label="Delivery available"
                selected={deliveryAvailable}
                disabled={saving}
                onPress={() => {
                  setDeliveryAvailable((current) => !current);
                }}
                style={styles.chip}
              />
            </View>
            {errors.fulfilment ? (
              <Text style={styles.error}>{errors.fulfilment}</Text>
            ) : null}

            <Text style={styles.section}>Offers</Text>
            <View style={styles.chipWrap}>
              <DGChip
                size="compact"
                label="Allow offers"
                selected={allowsOffers}
                disabled={saving}
                onPress={() => {
                  setAllowsOffers(true);
                }}
                style={styles.chip}
              />
              <DGChip
                size="compact"
                label="Fixed price"
                selected={!allowsOffers}
                disabled={saving}
                onPress={() => {
                  setAllowsOffers(false);
                }}
                style={styles.chip}
              />
            </View>

            {errors.form ? (
              <Text style={styles.formError}>{errors.form}</Text>
            ) : null}

            <DGButton
              title={saving ? 'Saving' : 'Save'}
              fullWidth
              loading={saving}
              disabled={saving || !dirty}
              onPress={() => {
                void handleSave();
              }}
              accessibilityLabel={saving ? 'Saving' : 'Save'}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: surface.page,
  },

  flex: {
    flex: 1,
  },

  header: {
    paddingTop: spacing.xxs,
    paddingBottom: 0,
  },

  headerRow: {
    minHeight: 46,
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: layout.bottomNavigationClearance,
    gap: spacing.sm,
  },

  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.card,
    gap: spacing.sm,
  },

  emptyTitle: {
    color: textColor.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  emptyBody: {
    color: textColor.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  retry: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },

  retryText: {
    color: palette.opportunityGreen,
    fontSize: 14,
    fontWeight: '800',
  },

  section: {
    ...typography.eyebrow,
    marginTop: spacing.xs,
    color: textColor.muted,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  chip: {
    marginRight: 0,
  },

  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
  },

  formError: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: '700',
  },

  descriptionInput: {
    minHeight: 132,
    alignItems: 'flex-start',
  },

  descriptionField: {
    minHeight: 120,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  currencyPrefix: {
    minHeight: 52,
    minWidth: 52,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },

  currencyPrefixError: {
    borderColor: palette.danger,
  },

  currencyPrefixDisabled: {
    backgroundColor: surface.page,
  },

  currencySymbol: {
    color: palette.opportunityGreen,
    fontSize: 16,
    fontWeight: '900',
  },

  currencySymbolDisabled: {
    opacity: 0.5,
  },

  priceInputWrap: {
    flex: 1,
  },

  priceInput: {
    marginBottom: 0,
  },

  locationHint: {
    color: textColor.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
