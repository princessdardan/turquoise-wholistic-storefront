"use client"

import { useChannel } from "@lib/context/channel-context"
import ProfessionalBadge from "@modules/common/components/professional-badge"

export default function NavProfessionalBadge() {
  const { channel, hydrated } = useChannel()

  return (
    <ProfessionalBadge show={hydrated && channel === "professional"} />
  )
}
