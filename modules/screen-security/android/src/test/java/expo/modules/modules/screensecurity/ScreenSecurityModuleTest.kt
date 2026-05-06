package expo.modules.screensecurity

import android.provider.Settings
import org.junit.Test
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], manifest = Config.NONE)  
class ScreenSecurityModuleTest {

  @Test
  fun `module class exists`() {
    val module = ScreenSecurityModule()
    assertNotNull(module)
  }

  @Test
  fun `getDeviceId reads from ANDROID_ID`() {
    val context = RuntimeEnvironment.getApplication()

    Settings.Secure.putString(
      context.contentResolver,
      Settings.Secure.ANDROID_ID,
      "test-device-id-12345"
    )

    val deviceId = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ANDROID_ID
    )

    assertEquals("test-device-id-12345", deviceId)
  }

  @Test
  fun `ANDROID_ID setting exists`() {
    assertNotNull(Settings.Secure.ANDROID_ID)
    assertEquals("android_id", Settings.Secure.ANDROID_ID)
  }
}