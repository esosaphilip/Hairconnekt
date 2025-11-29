"use client";

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/tokens";

function Table({ children, style }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "100%" }}>
      <View style={[styles.table, style]}>{children}</View>
    </ScrollView>
  );
}

function TableHeader({ children, style }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

function TableBody({ children, style }) {
  return <View style={style}>{children}</View>;
}

function TableFooter({ children, style }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

function TableRow({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

function TableHead({ children, style }) {
  return (
    <View style={[styles.cell, styles.headCell, style]}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={styles.headText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function TableCell({ children, style }) {
  return (
    <View style={[styles.cell, style]}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={styles.bodyText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function TableCaption({ children, style }) {
  return (
    <View style={[{ marginTop: 8 }, style]}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={{ fontSize: 12, color: theme.colors.gray600 }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: theme.colors.black,
  },
  cell: {
    justifyContent: "center",
    minWidth: 80,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  footer: {
    borderTopColor: theme.colors.gray200,
    borderTopWidth: 1,
  },
  headCell: {
    backgroundColor: theme.colors.gray50,
  },
  headText: {
    color: theme.colors.black,
    fontWeight: "600",
  },
  header: {
    borderBottomColor: theme.colors.gray200,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  row: {
    borderBottomColor: theme.colors.gray100,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  table: {
    width: "100%",
  },
});

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
