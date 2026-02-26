import {
  getStoreSettings,
  formatAddress,
  settingOrPlaceholder,
} from "@lib/data/store-settings"
import PlaceholderMarker from "@modules/common/components/placeholder-marker"

/**
 * Server component that renders a <ul> of business contact details
 * (email, phone, address) from store settings. Used in legal pages'
 * "Contact Us" sections.
 */
export default async function ContactInfoList() {
  const settings = await getStoreSettings()
  const fullAddress = formatAddress(settings)

  return (
    <ul>
      <li>
        Email:{" "}
        <PlaceholderMarker value={settings.email} placeholder="[EMAIL]" />
      </li>
      <li>
        Phone:{" "}
        <PlaceholderMarker value={settings.phone} placeholder="[PHONE]" />
      </li>
      <li>
        Address:{" "}
        <PlaceholderMarker value={fullAddress} placeholder="[ADDRESS]" />
      </li>
    </ul>
  )
}
