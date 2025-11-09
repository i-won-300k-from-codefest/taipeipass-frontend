'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FamilyMember {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    relation: string;
    coordinates: [number, number];
}

export interface CommonShelter {
    address: string;
    coordinates: [number, number];
    name?: string;
}

export interface FamilyData {
    members: FamilyMember[];
    commonShelter: CommonShelter | null;
}

interface FamilyContextType {
    familyData: FamilyData;
    addMember: (member: Omit<FamilyMember, 'id'>) => void;
    removeMember: (id: number) => void;
    updateMember: (id: number, member: Partial<FamilyMember>) => void;
    setCommonShelter: (shelter: CommonShelter | null) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
    const [familyData, setFamilyData] = useState<FamilyData>({
        members: [],
        commonShelter: null
    });

    // Load initial data from JSON on mount
    useEffect(() => {
        fetch('/emergency-contacts.json')
            .then((res) => res.json())
            .then((data) => {
                setFamilyData((prev) => ({
                    ...prev,
                    members: data.contacts || []
                }));
            })
            .catch((err) => console.error('Failed to load family members:', err));
    }, []);

    const addMember = (member: Omit<FamilyMember, 'id'>) => {
        const newId =
            familyData.members.length > 0
                ? Math.max(...familyData.members.map((m) => m.id)) + 1
                : 1;
        setFamilyData((prev) => ({
            ...prev,
            members: [...prev.members, { ...member, id: newId }]
        }));
    };

    const removeMember = (id: number) => {
        setFamilyData((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== id)
        }));
    };

    const updateMember = (id: number, updates: Partial<FamilyMember>) => {
        setFamilyData((prev) => ({
            ...prev,
            members: prev.members.map((m) => (m.id === id ? { ...m, ...updates } : m))
        }));
    };

    const setCommonShelter = (shelter: CommonShelter | null) => {
        setFamilyData((prev) => ({
            ...prev,
            commonShelter: shelter
        }));
    };

    return (
        <FamilyContext.Provider
            value={{
                familyData,
                addMember,
                removeMember,
                updateMember,
                setCommonShelter
            }}
        >
            {children}
        </FamilyContext.Provider>
    );
}

export function useFamily() {
    const context = useContext(FamilyContext);
    if (context === undefined) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
}
