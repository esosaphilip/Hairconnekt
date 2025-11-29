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
  table: {
    width: "100%",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    flexDirection: "row",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "center",
    minWidth: 80,
  },
  headCell: {
    backgroundColor: theme.colors.gray50,
  },
  headText: {
    fontWeight: "600",
    color: theme.colors.black,
  },
  bodyText: {
    color: theme.colors.black,
  },
});

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
