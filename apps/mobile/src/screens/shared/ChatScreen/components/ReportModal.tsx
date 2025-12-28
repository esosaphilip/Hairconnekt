import React from 'react';
import { Modal, TouchableWithoutFeedback, View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../ChatScreen.styles';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export const ReportModal = ({ visible, onClose, onSubmit }: ReportModalProps) => {
    const reasons = [
        { label: 'Belästigung', value: 'HARASSMENT' },
        { label: 'Unangemessener Inhalt', value: 'INAPPROPRIATE' },
        { label: 'Spam', value: 'SPAM' },
        { label: 'Sonstiges', value: 'OTHER' },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Nutzer melden</Text>
                            <Text style={styles.modalSubtitle}>Bitte wähle einen Grund:</Text>

                            {reasons.map((reason) => (
                                <TouchableOpacity
                                    key={reason.value}
                                    style={styles.modalOption}
                                    onPress={() => onSubmit(reason.value)}
                                >
                                    <Text style={styles.modalOptionText}>{reason.label}</Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.modalCancelText}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
