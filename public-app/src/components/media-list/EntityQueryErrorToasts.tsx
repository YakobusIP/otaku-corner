"use client";

import { Fragment } from "react";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

type Props = {
  errors: unknown[];
};

const EntityQueryErrorToast = ({ error }: { error: unknown }) => {
  useQueryErrorToast(error);
  return null;
};

export default function EntityQueryErrorToasts({ errors }: Props) {
  return (
    <Fragment>
      {errors.map((error, index) => (
        <Fragment key={index}>
          <EntityQueryErrorToast error={error} />
        </Fragment>
      ))}
    </Fragment>
  );
}
