import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  houseNo: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
  savedAddresses: Address[];
  onAddAddress: (address: Omit<Address, 'id'>) => void;
}

const SERVICEABLE_PINCODES = ['110001', '110002', '110003', '110005', '110020', '110048', '110092', '400001', '400050', '560001', '560034'];

export const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  onSelectAddress,
  savedAddresses,
  onAddAddress,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'serviceable' | 'unserviceable'>('idle');

  const checkPincodeServiceability = (code: string) => {
    setPincode(code);
    if (code.length === 6) {
      // Direct check or default serviceable if starts with 1, 2, 4, 5 for mock demo
      if (SERVICEABLE_PINCODES.includes(code) || ['1', '2', '4', '5', '6'].includes(code[0])) {
        setPincodeStatus('serviceable');
      } else {
        setPincodeStatus('unserviceable');
      }
    } else {
      setPincodeStatus('idle');
    }
  };

  const handleSave = () => {
    if (!name || !phone || !houseNo || !area || !pincode) return;
    onAddAddress({
      type,
      name,
      phone,
      houseNo,
      area,
      city,
      state: 'Delhi NCR',
      pincode,
      isDefault: savedAddresses.length === 0,
    });
    setShowAddForm(false);
    // Reset form
    setName('');
    setPhone('');
    setHouseNo('');
    setArea('');
    setPincode('');
    setPincodeStatus('idle');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="location" size={22} color="#A43700" />
              <Text style={styles.headerTitle}>Select Delivery Address</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {!showAddForm ? (
              <>
                <Text style={styles.sectionSubtitle}>Saved Addresses</Text>
                {savedAddresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={styles.addressCard}
                    onPress={() => {
                      onSelectAddress(addr);
                      onClose();
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.badge}>
                        {addr.type === 'Home' ? <Ionicons name="home" size={14} color="#A43700" /> : <Ionicons name="briefcase" size={14} color="#A43700" />}
                        <Text style={styles.badgeText}>{addr.type}</Text>
                      </View>
                      {addr.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                    </View>

                    <Text style={styles.cardName}>{addr.name} • {addr.phone}</Text>
                    <Text style={styles.cardAddress}>
                      {addr.houseNo}, {addr.area}, {addr.city} - {addr.pincode}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.addNewBtn} onPress={() => setShowAddForm(true)}>
                  <Ionicons name="add" size={18} color="#A43700" />
                  <Text style={styles.addNewBtnText}>Add New Delivery Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.sectionSubtitle}>New Address Details</Text>

                {/* Address Tag */}
                <View style={styles.typeRow}>
                  {(['Home', 'Work', 'Other'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, type === t && styles.typeChipActive]}
                      onPress={() => setType(t)}
                    >
                      <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Inputs */}
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number *"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                <TextInput
                  style={styles.input}
                  placeholder="House / Flat No., Building Name *"
                  placeholderTextColor="#94A3B8"
                  value={houseNo}
                  onChangeText={setHouseNo}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Street / Locality / Area *"
                  placeholderTextColor="#94A3B8"
                  value={area}
                  onChangeText={setArea}
                />

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Pincode *"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={checkPincodeServiceability}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: '#F8FAFC' }]}
                    placeholder="City"
                    value={city}
                    editable={false}
                  />
                </View>

                {/* Pincode Live Serviceability Status */}
                {pincodeStatus === 'serviceable' && (
                  <View style={styles.serviceStatusSuccess}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.serviceStatusSuccessText}>Delivery available in 30-45 mins!</Text>
                  </View>
                )}

                {pincodeStatus === 'unserviceable' && (
                  <View style={styles.serviceStatusError}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.serviceStatusErrorText}>Sorry, fresh sweets delivery currently unavailable here.</Text>
                  </View>
                )}

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
                    <Text style={styles.cancelBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      (!name || !phone || !houseNo || !area || pincodeStatus === 'unserviceable') && styles.saveBtnDisabled,
                    ]}
                    disabled={!name || !phone || !houseNo || !area || pincodeStatus === 'unserviceable'}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveBtnText}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#FCF9F4',
    borderWidth: 1,
    borderColor: '#F1E8DB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A43700',
  },
  defaultBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#A43700',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  addNewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A43700',
  },
  formContainer: {
    gap: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  typeChipActive: {
    backgroundColor: '#A43700',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  row: {
    flexDirection: 'row',
  },
  serviceStatusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
  },
  serviceStatusSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  serviceStatusError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
  },
  serviceStatusErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#A43700',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
