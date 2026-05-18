"use client";
import { useEffect } from "react";

export function AdminRouteTag() {
  useEffect(() => {
    document.body.dataset.route = "admin";
    return () => { delete document.body.dataset.route; };
  }, []);
  return null;
}
