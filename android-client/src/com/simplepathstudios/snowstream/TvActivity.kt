package com.simplepathstudios.snowstream;

// At first I wanted to do straight Java like my other apps. I ran into some roadblocks and looked into alternatives.
// I tried out react-native. It failed to run the skeleton Android app because some "flipper" dependency had a conflict once I added some component libraries.
// I tried out expo. It literally could not run the skeleton Android app at all.
// Then I went back to straight Java, except all of the fragmented Android docs are in Kotlin and JetPack compose.
// What...a...clusterfuck. Mobile development is an exercise in extreme masochism. And I am no masochist.
// https://github.com/android/tv-samples/tree/main/JetStreamCompose
// I really wanted a shared codebase between mobile and tv, but it just isn't worth the hassle.


import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.LocalContentColor
import androidx.tv.material3.MaterialTheme

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalTvMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        setContent {
                Box(
                    modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.surface)
                ) {
                    CompositionLocalProvider(
                        LocalContentColor provides MaterialTheme.colorScheme.onSurface
                    ) {
                        App(
                            onBackPressed = onBackPressedDispatcher::onBackPressed,
                        )
                    }
                }
        }
    }
}