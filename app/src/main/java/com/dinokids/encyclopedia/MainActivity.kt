package com.dinokids.encyclopedia

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.Crossfade
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import com.dinokids.encyclopedia.audio.DinoSpeaker
import com.dinokids.encyclopedia.model.DinoRepository
import com.dinokids.encyclopedia.ui.screens.DetailScreen
import com.dinokids.encyclopedia.ui.screens.FullScreen3DScreen
import com.dinokids.encyclopedia.ui.screens.HomeScreen
import com.dinokids.encyclopedia.ui.theme.DinoKidsTheme

class MainActivity : ComponentActivity() {
    private lateinit var speaker: DinoSpeaker

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        speaker = DinoSpeaker(this)

        setContent {
            DinoKidsTheme {
                DinoKidsAppRoot(speaker = speaker)
            }
        }
    }

    override fun onDestroy() {
        speaker.shutdown()
        super.onDestroy()
    }
}

private enum class ScreenMode {
    HOME,
    DETAIL,
    FULLSCREEN_3D
}

@Composable
private fun DinoKidsAppRoot(speaker: DinoSpeaker) {
    val allDinos = DinoRepository.allDinosaurs
    var screenMode by rememberSaveable { mutableStateOf(ScreenMode.HOME) }
    var selectedDinoId by rememberSaveable { mutableStateOf(allDinos.first().id) }

    val currentIndex = allDinos.indexOfFirst { it.id == selectedDinoId }.coerceAtLeast(0)
    val currentDino = allDinos[currentIndex]

    BackHandler(enabled = screenMode != ScreenMode.HOME) {
        speaker.stop()
        screenMode = when (screenMode) {
            ScreenMode.FULLSCREEN_3D -> ScreenMode.DETAIL
            ScreenMode.DETAIL -> ScreenMode.HOME
            ScreenMode.HOME -> ScreenMode.HOME
        }
    }

    Crossfade(targetState = screenMode, label = "screen_transition") { mode ->
        when (mode) {
            ScreenMode.HOME -> {
                HomeScreen(
                    dinosaurs = allDinos,
                    onSelectDino = { dino ->
                        selectedDinoId = dino.id
                        screenMode = ScreenMode.DETAIL
                    },
                    onRandomDino = {
                        val pick = allDinos.random()
                        selectedDinoId = pick.id
                        screenMode = ScreenMode.DETAIL
                    }
                )
            }

            ScreenMode.DETAIL -> {
                DetailScreen(
                    dino = currentDino,
                    currentIndex = currentIndex,
                    totalCount = allDinos.size,
                    speaker = speaker,
                    onBack = { screenMode = ScreenMode.HOME },
                    onPrevious = {
                        val prevIdx = if (currentIndex == 0) allDinos.lastIndex else currentIndex - 1
                        selectedDinoId = allDinos[prevIdx].id
                    },
                    onNext = {
                        val nextIdx = (currentIndex + 1) % allDinos.size
                        selectedDinoId = allDinos[nextIdx].id
                    },
                    onOpenFullScreen3D = { screenMode = ScreenMode.FULLSCREEN_3D }
                )
            }

            ScreenMode.FULLSCREEN_3D -> {
                FullScreen3DScreen(
                    dino = currentDino,
                    speaker = speaker,
                    onClose = { screenMode = ScreenMode.DETAIL }
                )
            }
        }
    }
}
