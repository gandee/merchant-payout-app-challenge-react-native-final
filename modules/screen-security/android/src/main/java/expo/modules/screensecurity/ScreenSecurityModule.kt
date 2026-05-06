package expo.modules.screensecurity

import android.app.Activity
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class ScreenSecurityModule : Module() {

  private var screenCaptureCallback: Any? = null

  override fun definition() = ModuleDefinition {
    Name("ScreenSecurity")

    Function("getDeviceId") {
      val context = appContext.reactContext ?: return@Function ""
      Settings.Secure.getString(
        context.contentResolver,
        Settings.Secure.ANDROID_ID
      )
    }

    AsyncFunction("isBiometricAuthenticated") { promise: Promise ->
      Log.d("ScreenSecurity", "isBiometricAuthenticated called")
      val activity = appContext.currentActivity
      if (activity == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      val biometricManager = BiometricManager.from(activity)
      val canAuthenticate = biometricManager.canAuthenticate(
        BiometricManager.Authenticators.BIOMETRIC_STRONG 
        //or
        //BiometricManager.Authenticators.DEVICE_CREDENTIAL
      )
when (canAuthenticate) {
  BiometricManager.BIOMETRIC_SUCCESS -> {
    Log.d("ScreenSecurity", "Biometrics available — showing prompt")
  }
  BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
    Log.e("ScreenSecurity", "No biometrics enrolled — rejecting promise")
    promise.reject(
      "BIOMETRIC_NOT_ENROLLED",
      "Please set up biometrics in your device Settings.",
      null
    )
    return@AsyncFunction
  }
  BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
    Log.e("ScreenSecurity", "No biometric hardware")
    promise.reject(
      "BIOMETRIC_NOT_AVAILABLE",
      "No biometric hardware available",
      null
    )
    return@AsyncFunction
  }
  else -> {
    Log.e("ScreenSecurity", "Biometrics not available: $canAuthenticate")
    promise.reject(
      "BIOMETRIC_NOT_AVAILABLE",
      "Biometric authentication not available",
      null
    )
    return@AsyncFunction
  }
}
      if (activity !is androidx.fragment.app.FragmentActivity) {
        promise.resolve(false)
        return@AsyncFunction
      }
      val fragmentActivity = activity as androidx.fragment.app.FragmentActivity
      val executor = ContextCompat.getMainExecutor(fragmentActivity)
      val callback = object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(
          result: BiometricPrompt.AuthenticationResult
        ) {
          Log.d("ScreenSecurity", "Authentication succeeded")
          promise.resolve(true)
        }
        override fun onAuthenticationFailed() {
          promise.resolve(false)
        }
        override fun onAuthenticationError(
          errorCode: Int,
          errString: CharSequence
        ) {
          Log.e("ScreenSecurity", "Authentication error: $errorCode - $errString")
          promise.resolve(false)
        }
      }
      val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Confirm Payout")
        .setSubtitle("Authenticate to proceed with payout over £1,000")
        .setAllowedAuthenticators(
          BiometricManager.Authenticators.BIOMETRIC_STRONG 
          //or
          //BiometricManager.Authenticators.DEVICE_CREDENTIAL
        )
        .setNegativeButtonText("Cancel") 
        .build()
      fragmentActivity.runOnUiThread {
        Log.d("ScreenSecurity", "Showing biometric prompt on UI thread")
        BiometricPrompt(fragmentActivity, executor, callback)
          .authenticate(promptInfo)
      }
    }

    Events("onScreenshotTaken")

    Function("startScreenshotDetection") {
      Log.d("ScreenSecurity", "startScreenshotDetection called")
      val activity = appContext.currentActivity ?: return@Function null
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        val callback = Activity.ScreenCaptureCallback {
          Log.d("ScreenSecurity", "Screenshot taken!")
          sendEvent("onScreenshotTaken", mapOf(
            "timestamp" to System.currentTimeMillis()
          ))
        }
        activity.registerScreenCaptureCallback(
          activity.mainExecutor,
          callback
        )
        screenCaptureCallback = callback
        Log.d("ScreenSecurity", "Screenshot detection registered")
      }
      return@Function null
    }

    Function("stopScreenshotDetection") {
      Log.d("ScreenSecurity", "stopScreenshotDetection called")
      val activity = appContext.currentActivity ?: return@Function null
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        screenCaptureCallback?.let {
          activity.unregisterScreenCaptureCallback(
            it as Activity.ScreenCaptureCallback
          )
          screenCaptureCallback = null
          Log.d("ScreenSecurity", "Screenshot detection unregistered")
        }
      }
      return@Function null
    }
  }
}